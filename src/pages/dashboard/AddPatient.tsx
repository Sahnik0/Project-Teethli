
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
import { Loader2, Upload, UserCircle, Image } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AddPatient = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosisDescription, setDiagnosisDescription] = useState('');
  const [medicalImage, setMedicalImage] = useState<File | null>(null);
  const [medicalImagePreview, setMedicalImagePreview] = useState<string | null>(null);
  const [patientImage, setPatientImage] = useState<File | null>(null);
  const [patientImagePreview, setPatientImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'medical' | 'patient') => {
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
      
      // Set the appropriate state based on image type
      if (type === 'medical') {
        setMedicalImage(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setMedicalImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPatientImage(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPatientImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
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
    
    // Validate mandatory medical image
    if (!medicalImage) {
      toast({
        variant: "destructive",
        title: "Missing medical image",
        description: "Please upload a medical condition image",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const patientData = {
        name,
        age: parseInt(age),
        sex,
        address,
        symptoms,
        diagnosisDescription,
      };
      
      const patient = await addPatient(
        doctor.id, 
        patientData, 
        medicalImage,
        patientImage || undefined
      );
      
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle>Add New Patient</CardTitle>
        <CardDescription>
          Create a new Teethli patient record and generate a prescription
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="transition-all duration-300">
              Patient Info
            </TabsTrigger>
            <TabsTrigger value="diagnosis" className="transition-all duration-300">
              Diagnosis
            </TabsTrigger>
            <TabsTrigger value="images" className="transition-all duration-300">
              Images
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="animate-fade-in">
            <CardContent className="space-y-6 pt-4">
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
                    className="transition duration-200 hover:border-medical-primary focus:border-medical-primary"
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
                    className="transition duration-200 hover:border-medical-primary focus:border-medical-primary"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="sex" className="text-sm font-medium">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <Select value={sex} onValueChange={(value) => setSex(value as 'Male' | 'Female' | 'Other')}>
                    <SelectTrigger className="transition duration-200 hover:border-medical-primary focus:border-medical-primary">
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
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Input
                    id="address"
                    placeholder="Patient's address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="transition duration-200 hover:border-medical-primary focus:border-medical-primary"
                  />
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveTab("diagnosis")}
                className="w-full transition-transform duration-200 hover:scale-105"
              >
                Next: Diagnosis Information
              </Button>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="diagnosis" className="animate-fade-in">
            <CardContent className="space-y-6 pt-4">
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
                  className="min-h-[100px] transition duration-200 hover:border-medical-primary focus:border-medical-primary"
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
                  className="min-h-[100px] transition duration-200 hover:border-medical-primary focus:border-medical-primary"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab("info")}
                  className="flex-1 transition-transform duration-200 hover:scale-105"
                >
                  Back: Patient Info
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab("images")}
                  className="flex-1 transition-transform duration-200 hover:scale-105"
                >
                  Next: Images
                </Button>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="images" className="animate-fade-in">
            <CardContent className="space-y-6 pt-4">
              {/* Medical Image Upload */}
              <div className="space-y-2">
                <label htmlFor="medicalImage" className="text-sm font-medium flex items-center">
                  <Image className="h-4 w-4 mr-1 text-medical-primary" />
                  Medical Condition Image <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md transition-all duration-300 hover:border-medical-primary hover:bg-medical-light/20">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    {medicalImagePreview ? (
                      <div className="relative hover-scale">
                        <img 
                          src={medicalImagePreview} 
                          alt="Medical condition preview" 
                          className="max-h-48 max-w-full rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 right-0 animate-fade-in"
                          onClick={() => {
                            setMedicalImage(null);
                            setMedicalImagePreview(null);
                          }}
                        >
                          &times;
                        </Button>
                      </div>
                    ) : (
                      <Image className="h-10 w-10 text-muted-foreground animate-pulse" />
                    )}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        {medicalImagePreview ? "Change Medical Image" : "Upload a medical condition image"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        This image will be used to show the medical condition (Max 5MB)
                      </div>
                    </div>
                    <Input
                      id="medicalImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'medical')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("medicalImage")?.click()}
                      className="transition-transform duration-200 hover:scale-105"
                    >
                      {medicalImagePreview ? "Replace" : "Select Image"}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Patient Photo Upload */}
              <div className="space-y-2">
                <label htmlFor="patientImage" className="text-sm font-medium flex items-center">
                  <UserCircle className="h-4 w-4 mr-1 text-medical-primary" />
                  Patient Photo (Optional)
                </label>
                <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md transition-all duration-300 hover:border-medical-primary hover:bg-medical-light/20">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    {patientImagePreview ? (
                      <div className="relative hover-scale">
                        <img 
                          src={patientImagePreview} 
                          alt="Patient photo preview" 
                          className="max-h-48 max-w-full rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 right-0 animate-fade-in"
                          onClick={() => {
                            setPatientImage(null);
                            setPatientImagePreview(null);
                          }}
                        >
                          &times;
                        </Button>
                      </div>
                    ) : (
                      <UserCircle className="h-10 w-10 text-muted-foreground animate-pulse" />
                    )}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        {patientImagePreview ? "Change Patient Photo" : "Upload a patient photo"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        This photo will appear in the patient profile section of the prescription (Max 5MB)
                      </div>
                    </div>
                    <Input
                      id="patientImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'patient')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("patientImage")?.click()}
                      className="transition-transform duration-200 hover:scale-105"
                    >
                      {patientImagePreview ? "Replace" : "Select Photo"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveTab("diagnosis")}
                className="w-full transition-transform duration-200 hover:scale-105"
              >
                Back: Diagnosis Information
              </Button>
            </CardContent>
          </TabsContent>
        </Tabs>
                
        <CardFooter className="pb-6">
          <div className="flex justify-end gap-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="transition-transform duration-200 hover:scale-105"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-medical-primary hover:bg-medical-secondary transition-all duration-300 hover:scale-105"
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