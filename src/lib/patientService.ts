import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Patient } from './types';
import { GeminiResponse, generateDiagnosisAndTreatment } from './geminiService';
import { toast } from '@/hooks/use-toast';
import { uploadToCloudinary } from './cloudinaryService';

// Function to upload an image to Cloudinary with retry logic
const uploadImageWithRetry = async (
  doctorId: string, 
  imageFile: File, 
  maxRetries = 3
): Promise<{imageUrl: string, publicId: string}> => {
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      console.log(`Attempt ${retries + 1}: Uploading image to Cloudinary`);
      
      const uploadResult = await uploadToCloudinary(
        imageFile, 
        `patients/${doctorId}`
      );
      
      console.log("Cloudinary upload successful:", uploadResult.secure_url);
      
      return {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    } catch (error) {
      lastError = error;
      console.error(`Upload attempt ${retries + 1} failed:`, error);
      retries++;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
  
  console.error("All upload attempts failed");
  throw lastError || new Error("Failed to upload image after multiple attempts");
};

export const addPatient = async (
  doctorId: string, 
  patientData: Omit<Patient, 'id' | 'doctorId' | 'createdAt' | 'updatedAt'>,
  imageFile?: File
): Promise<Patient> => {
  try {
    // First, upload the image if provided
    let imageUrl = '';
    let imagePublicId = '';
    
    if (imageFile) {
      try {
        const uploadResult = await uploadImageWithRetry(doctorId, imageFile);
        imageUrl = uploadResult.imageUrl;
        imagePublicId = uploadResult.publicId;
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          variant: "destructive",
          title: "Image Upload Failed",
          description: "We'll continue without the image. You can try adding it later."
        });
        // Continue without image
      }
    }
    
    // Generate diagnosis and treatment using Gemini API
    let aiResponse: GeminiResponse;
    try {
      aiResponse = await generateDiagnosisAndTreatment(
        patientData.symptoms,
        patientData.diagnosisDescription,
        patientData.age,
        patientData.sex
      );
      console.log("AI response generated successfully:", aiResponse);
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        variant: "default",
        title: "AI Diagnosis Generation Failed",
        description: "Using fallback diagnosis. You can update it manually."
      });
      // Provide fallback diagnosis and treatment
      aiResponse = {
        diagnosis: `Based on the symptoms described (${patientData.symptoms}) and the doctor's initial assessment, a preliminary diagnosis is suggested.`,
        treatment: `1. Treatment will be based on further clinical evaluation.\n2. Rest and hydration as needed.\n3. Follow-up in 7-10 days or sooner if symptoms worsen.`
      };
    }
    
    // Create patient document
    const patientRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      doctorId,
      imageUrl,
      imagePublicId,
      diagnosis: aiResponse.diagnosis,
      treatment: aiResponse.treatment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Fetch the created document
    const patientSnapshot = await getDoc(patientRef);
    
    if (patientSnapshot.exists()) {
      return {
        id: patientSnapshot.id,
        ...patientSnapshot.data()
      } as Patient;
    } else {
      throw new Error("Failed to create patient record");
    }
  } catch (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
};

export const updatePatient = async (
  patientId: string,
  patientData: Partial<Patient>,
  imageFile?: File
): Promise<Patient> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientSnapshot = await getDoc(patientRef);
    
    if (!patientSnapshot.exists()) {
      throw new Error("Patient not found");
    }
    
    const currentPatient = patientSnapshot.data() as Patient;
    let imageUrl = currentPatient.imageUrl || '';
    let imagePublicId = currentPatient.imagePublicId || '';
    
    // If a new image is provided, upload it
    if (imageFile) {
      // Upload new image to Cloudinary (old images will be automatically removed by Cloudinary media library policies)
      try {
        const uploadResult = await uploadImageWithRetry(
          currentPatient.doctorId, 
          imageFile
        );
        imageUrl = uploadResult.imageUrl;
        imagePublicId = uploadResult.publicId;
      } catch (error) {
        console.error("Error uploading new image:", error);
        toast({
          variant: "destructive",
          title: "Image Upload Failed",
          description: "We'll continue with the existing image."
        });
        // Continue with existing image
      }
    }
    
    // Update patient with new data
    const updateData = {
      ...patientData,
      imageUrl,
      imagePublicId,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(patientRef, updateData);
    
    // Fetch updated document
    const updatedSnapshot = await getDoc(patientRef);
    
    if (updatedSnapshot.exists()) {
      return {
        id: updatedSnapshot.id,
        ...updatedSnapshot.data()
      } as Patient;
    } else {
      throw new Error("Failed to update patient record");
    }
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
};

export const getPatient = async (patientId: string): Promise<Patient> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientSnapshot = await getDoc(patientRef);
    
    if (patientSnapshot.exists()) {
      return {
        id: patientSnapshot.id,
        ...patientSnapshot.data()
      } as Patient;
    } else {
      throw new Error("Patient not found");
    }
  } catch (error) {
    console.error("Error getting patient:", error);
    throw error;
  }
};

export const getPatientsByDoctor = async (doctorId: string): Promise<Patient[]> => {
  try {
    const patientsQuery = query(
      collection(db, 'patients'),
      where('doctorId', '==', doctorId),
      orderBy('createdAt', 'desc')
    );
    
    const patientsSnapshot = await getDocs(patientsQuery);
    const patients: Patient[] = [];
    
    patientsSnapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data()
      } as Patient);
    });
    
    return patients;
  } catch (error) {
    console.error("Error getting patients:", error);
    throw error;
  }
};

export const searchPatients = async (doctorId: string, searchTerm: string): Promise<Patient[]> => {
  try {
    // Due to Firestore limitations, we'll fetch all patients for the doctor and filter
    // In a production app, you would use a more sophisticated search solution
    const patients = await getPatientsByDoctor(doctorId);
    
    // Filter results based on name
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching patients:", error);
    throw error;
  }
};

export const deletePatient = async (patientId: string): Promise<void> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientSnapshot = await getDoc(patientRef);
    
    if (!patientSnapshot.exists()) {
      throw new Error("Patient not found");
    }
    
    // Delete patient document - note: We don't need to explicitly delete Cloudinary images
    // as they can be managed through the Cloudinary Dashboard with auto-deletion policies
    await deleteDoc(patientRef);
  } catch (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
};
