
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { addPatient } from '@/lib/patientService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

const AddPatient = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosisDescription, setDiagnosisDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Image must be less than 5MB"
        });
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a JPG, PNG or WebP image"
        });
        return;
      }
      
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctor?.id) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to add a patient",
      });
      return;
    }
    
    // Validate inputs
    if (!name || !age || !symptoms || !diagnosisDescription) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const patientData = {
        name,
        age: parseInt(age),
        sex,
        symptoms,
        diagnosisDescription,
      };
      
      const patient = await addPatient(doctor.id, patientData, image || undefined);
      
      toast({
        title: "Patient added successfully",
        description: "The patient record and prescription have been created",
      });
      
      // Navigate to the patient details page
      navigate(`/dashboard/patient/${patient.id}`);
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        variant: "destructive",
        title: "Failed to add patient",
        description: "An error occurred while creating the patient record",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Patient</CardTitle>
        <CardDescription>
          Create a new patient record and generate a prescription
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium">
                Age <span className="text-red-500">*</span>
              </label>
              <Input
                id="age"
                type="number"
                placeholder="Age in years"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="0"
                max="120"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="sex" className="text-sm font-medium">
              Sex <span className="text-red-500">*</span>
            </label>
            <Select value={sex} onValueChange={(value) => setSex(value as 'Male' | 'Female' | 'Other')}>
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="symptoms" className="text-sm font-medium">
              Symptoms <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="symptoms"
              placeholder="Describe the patient's symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="diagnosisDescription" className="text-sm font-medium">
              Doctor's Initial Diagnosis <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="diagnosisDescription"
              placeholder="Enter your initial diagnosis"
              value={diagnosisDescription}
              onChange={(e) => setDiagnosisDescription(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Image Upload (Optional)
            </label>
            <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md">
              <div className="flex flex-col items-center space-y-4 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 max-w-full rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-0 right-0"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                    >
                      &times;
                    </Button>
                  </div>
                ) : (
                  <Upload className="h-10 w-10 text-muted-foreground" />
                )}
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {imagePreview ? "Change Image" : "Upload an image"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Upload a medical image related to the patient's condition (Max 5MB)
                  </div>
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("image")?.click()}
                >
                  {imagePreview ? "Replace" : "Select Image"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end gap-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-medical-primary hover:bg-medical-secondary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Patient & Prescription"
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddPatient;
