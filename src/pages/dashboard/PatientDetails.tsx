import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPatient, deletePatient, updatePatient } from '@/lib/patientService';
import { Patient } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from '@/hooks/use-toast';
import { Printer, Trash, ArrowLeft, Loader2, MapPin, CalendarDays, User, Clock, Edit, Save, AlertCircle } from 'lucide-react';
import { getOptimizedImageUrl, getPatientPortraitUrl, getMedicalImageUrl } from '@/lib/cloudinaryService';
import { Textarea } from '@/components/ui/textarea';
import FormattedTreatment from '@/components/FormattedTreatment';

const PatientDetails = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(false);
  const [editedDiagnosis, setEditedDiagnosis] = useState('');
  const [editedTreatment, setEditedTreatment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const { doctor } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') || 'prescription';
  const [currentDateTime] = useState(new Date());

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        if (patientId) {
          const patientData = await getPatient(patientId);
          setPatient(patientData);
          setEditedDiagnosis(patientData.diagnosis || '');
          setEditedTreatment(patientData.treatment || '');
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load patient data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleSaveDiagnosis = async () => {
    if (!patient || !patientId) return;
    
    setIsSaving(true);
    try {
      await updatePatient(patientId, { diagnosis: editedDiagnosis });
      setPatient({
        ...patient,
        diagnosis: editedDiagnosis
      });
      setEditingDiagnosis(false);
      toast({
        title: "Success",
        description: "Diagnosis updated successfully",
      });
    } catch (error) {
      console.error('Error updating diagnosis:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update diagnosis",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTreatment = async () => {
    if (!patient || !patientId) return;
    
    setIsSaving(true);
    try {
      await updatePatient(patientId, { treatment: editedTreatment });
      setPatient({
        ...patient,
        treatment: editedTreatment
      });
      setEditingTreatment(false);
      toast({
        title: "Success",
        description: "Treatment plan updated successfully",
      });
    } catch (error) {
      console.error('Error updating treatment plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update treatment plan",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const printContent = prescriptionRef.current;
    
    if (printContent) {
      const printStyles = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap');
          body {
            font-family: 'Nunito Sans', sans-serif;
            padding: 20px;
            color: #1A365D;
          }
          .prescription {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            border: 1px solid #ccc;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2D5986;
          }
          .doctor-info h1 {
            font-size: 24px;
            margin: 0;
            color: #1A365D;
          }
          .doctor-info p {
            margin: 5px 0;
            color: #2D5986;
          }
          .patient-info {
            margin-bottom: 30px;
          }
          .patient-info h2 {
            font-size: 18px;
            margin-bottom: 10px;
            color: #1A365D;
          }
          .patient-info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .patient-info-item p {
            margin: 0;
          }
          .patient-info-label {
            font-weight: 600;
            color: #1A365D;
          }
          .diagnosis-section h2, .treatment-section h2 {
            font-size: 18px;
            margin-bottom: 10px;
            color: #1A365D;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
          }
          .rx-symbol {
            font-size: 24px;
            font-weight: bold;
            margin-right: 10px;
            color: #1A365D;
          }
          .medical-image {
            max-width: 100%;
            max-height: 300px;
            margin: 15px auto;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            display: block;
          }
          .patient-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e5e7eb;
            margin-right: 10px;
            vertical-align: middle;
          }
          .patient-name-with-avatar {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: right;
            font-style: italic;
            color: #2D5986;
          }
          .timestamp {
            font-size: 14px;
            color: #2D5986;
            text-align: right;
            margin-bottom: 10px;
          }
          .treatment-plan-content ul {
            padding-left: 20px;
            list-style-type: none;
            margin-top: 10px;
          }
          .treatment-plan-content li {
            position: relative;
            padding-left: 15px;
            margin-bottom: 8px;
            line-height: 1.5;
          }
          .treatment-plan-content li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #2D5986;
            font-weight: bold;
          }
          .bold-text {
            font-weight: 700;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      `;
      
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Prescription - Teethli</title>');
        printWindow.document.write(printStyles);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        printWindow.onload = function() {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        };
      }
    }
  };

  const handleDelete = async () => {
    if (!patientId) return;
    
    setIsDeleting(true);
    try {
      await deletePatient(patientId);
      toast({
        title: "Patient deleted",
        description: "The patient record has been deleted successfully",
      });
      navigate('/dashboard/patients');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete patient record",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-medical-primary mb-2">Patient Not Found</h2>
        <p className="text-gray-600 mb-6">The patient record you're looking for doesn't exist or has been removed.</p>
        <Button
          onClick={() => navigate('/dashboard/patients')}
          className="bg-medical-primary hover:bg-medical-secondary transition-all duration-300 hover:scale-105"
        >
          Back to Patients
        </Button>
      </div>
    );
  }

  const formatDate = (date: Date | number | any | undefined): string => {
    if (!date) return "N/A";
    
    let dateToFormat: Date;
    
    try {
      if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
        dateToFormat = date.toDate();
      }
      else if (typeof date === 'number') {
        dateToFormat = new Date(date);
      }
      else if (date instanceof Date) {
        dateToFormat = date;
      }
      else if (typeof date === 'string') {
        dateToFormat = new Date(date);
      }
      else {
        console.error("Invalid date format:", date);
        return "Invalid Date";
      }
      
      if (isNaN(dateToFormat.getTime())) {
        console.error("Invalid date value:", date);
        return "Invalid Date";
      }
      
      return dateToFormat.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error";
    }
  };

  const formatTime = (date: Date): string => {
    try {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Error";
    }
  };

  const getMedicalConditionImageUrl = () => {
    if (patient.imagePublicId) {
      return getMedicalImageUrl(patient.imagePublicId);
    }
    return patient.imageUrl || '';
  };

  const getPatientPhotoUrl = () => {
    if (patient.patientImagePublicId) {
      return getPatientPortraitUrl(patient.patientImagePublicId);
    }
    return patient.patientImageUrl || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-fade-in">
        <Button 
          variant="ghost" 
          className="flex items-center text-medical-primary transition-all duration-200 hover:scale-105" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center transition-transform duration-200 hover:scale-105"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Prescription
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex items-center transition-transform duration-200 hover:scale-105"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="animate-scale-in">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  patient record and associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-medical-primary">Patient Information</CardTitle>
          <CardDescription>
            Detailed information about {patient.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 animate-fade-in">
                <User className="text-medical-primary h-5 w-5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p className="text-lg font-semibold">{patient.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "50ms" }}>
                <CalendarDays className="text-medical-primary h-5 w-5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Age</h3>
                  <p className="text-lg">{patient.age} years</p>
                </div>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                <h3 className="text-sm font-medium text-gray-500">Sex</h3>
                <p className="text-lg">{patient.sex}</p>
              </div>

              {patient.address && (
                <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
                  <MapPin className="text-medical-primary h-5 w-5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="text-lg">{patient.address}</p>
                  </div>
                </div>
              )}

              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                <p className="text-lg">{formatDate(patient.createdAt)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
                <h3 className="text-sm font-medium text-gray-500">Symptoms</h3>
                <p className="text-md">{patient.symptoms}</p>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                <h3 className="text-sm font-medium text-gray-500">Doctor's Initial Diagnosis</h3>
                <p className="text-md">{patient.diagnosisDescription}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {(patient.patientImageUrl || patient.patientImagePublicId) && (
                  <div className="animate-fade-in" style={{ animationDelay: "350ms" }}>
                    <h3 className="text-sm font-medium text-gray-500">Patient Photo</h3>
                    <div className="mt-2 overflow-hidden rounded-lg border hover:scale-105 transition-transform duration-300">
                      <img 
                        src={getPatientPhotoUrl()} 
                        alt="Patient" 
                        className="max-h-56 w-full object-cover"
                        onError={(e) => {
                          console.error("Patient photo failed to load");
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Photo+Not+Available';
                        }}
                      />
                    </div>
                  </div>
                )}

                {(patient.imageUrl || patient.imagePublicId) && (
                  <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
                    <h3 className="text-sm font-medium text-gray-500">Medical Condition</h3>
                    <div className="mt-2 overflow-hidden rounded-lg border hover:scale-105 transition-transform duration-300">
                      <img 
                        src={getMedicalConditionImageUrl()} 
                        alt="Medical condition" 
                        className="max-h-56 w-full object-cover"
                        onError={(e) => {
                          console.error("Medical image failed to load");
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue={defaultTab} className="animate-fade-in" style={{ animationDelay: "450ms" }}>
        <TabsList>
          <TabsTrigger value="prescription" className="transition-all duration-200 hover:bg-medical-light">Generated Prescription</TabsTrigger>
          <TabsTrigger value="diagnosis" className="transition-all duration-200 hover:bg-medical-light">AI Diagnosis</TabsTrigger>
          <TabsTrigger value="treatment" className="transition-all duration-200 hover:bg-medical-light">Treatment Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prescription" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Teethli Medical Prescription</CardTitle>
              <CardDescription>
                AI-generated based on the patient information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={prescriptionRef} 
                className="bg-white p-6 rounded-lg border shadow-sm prescription prescription-paper"
              >
                <div className="header">
                  <div className="doctor-info">
                    <h1>Dr. {doctor?.name || "Medical Professional"}</h1>
                    <p>{doctor?.specialization || "General Practitioner"}</p>
                    <p>{doctor?.clinicName || "Teethli Medical Clinic"}</p>
                    <p>{doctor?.clinicAddress || ""}</p>
                  </div>
                  <div className="prescription-date">
                    <p><strong>Date:</strong> {formatDate(patient.createdAt)}</p>
                    <p><strong>Time:</strong> {formatTime(currentDateTime)}</p>
                    <img 
                      src="/teethli-logo.png" 
                      alt="Teethli" 
                      style={{ height: '40px', marginTop: '10px' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
                
                <div className="patient-info">
                  <h2>Patient Information</h2>
                  
                  <div className="patient-info-grid">
                    <div className="patient-info-item">
                      <div className="patient-name-with-avatar">
                        {(patient.patientImageUrl || patient.patientImagePublicId) ? (
                          <img
                            src={getPatientPhotoUrl()}
                            alt={patient.name}
                            className="patient-avatar"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50?text=P';
                            }}
                          />
                        ) : (
                          <div 
                            className="patient-avatar flex items-center justify-center bg-gray-200"
                            style={{ display: "inline-flex" }}
                          >
                            {patient.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="patient-info-label">Name:</p>
                          <p className="font-medium">{patient.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="patient-info-item">
                      <p className="patient-info-label">Age:</p>
                      <p>{patient.age} years</p>
                    </div>
                    <div className="patient-info-item">
                      <p className="patient-info-label">Sex:</p>
                      <p>{patient.sex}</p>
                    </div>
                    {patient.address && (
                      <div className="patient-info-item">
                        <p className="patient-info-label">Address:</p>
                        <p>{patient.address}</p>
                      </div>
                    )}
                    <div className="patient-info-item">
                      <p className="patient-info-label">Symptoms:</p>
                      <p>{patient.symptoms}</p>
                    </div>
                  </div>
                  
                  {(patient.imageUrl || patient.imagePublicId) && (
                    <div className="mt-4">
                      <p className="mb-2 font-medium text-medical-primary">Medical Condition Image:</p>
                      <img 
                        src={getMedicalConditionImageUrl()} 
                        alt="Medical condition" 
                        className="medical-image max-h-64 mx-auto rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x300?text=Image+Not+Available';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="diagnosis-section">
                  <h2><span className="rx-symbol">℞</span> Diagnosis</h2>
                  <p>{patient.diagnosis}</p>
                </div>
                
                <div className="treatment-section">
                  <h2>Treatment Plan</h2>
                  <FormattedTreatment treatmentText={patient.treatment} />
                </div>
                
                <div className="footer">
                  <p>Doctor's Signature: ____________________</p>
                  <p>Teethli - Advanced Medical Solutions</p>
                  <div className="timestamp">
                    <p>Generated on: {formatDate(currentDateTime)} at {formatTime(currentDateTime)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-medical-primary hover:bg-medical-secondary transition-all duration-300 hover:scale-105"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Prescription
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="diagnosis" className="animate-fade-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI-Generated Diagnosis</CardTitle>
                <CardDescription>
                  Diagnosis generated using Gemini API
                </CardDescription>
              </div>
              <Button
                variant={editingDiagnosis ? "default" : "outline"}
                size="sm"
                onClick={() => setEditingDiagnosis(!editingDiagnosis)}
                className="ml-auto transition-all duration-200"
              >
                {editingDiagnosis ? (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Diagnosis
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {editingDiagnosis ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedDiagnosis}
                    onChange={(e) => setEditedDiagnosis(e.target.value)}
                    placeholder="Enter diagnosis details..."
                    className="min-h-32 transition-all duration-200 focus:border-medical-primary"
                  />
                  <Button
                    onClick={handleSaveDiagnosis}
                    disabled={isSaving}
                    className="bg-medical-primary hover:bg-medical-secondary transition-all duration-200"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Diagnosis
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg animate-fadeIn">
                  <h3 className="font-medium text-lg mb-2 text-medical-primary">Diagnosis</h3>
                  <p className="whitespace-pre-line">{patient.diagnosis}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="treatment" className="animate-fade-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Treatment Plan</CardTitle>
                <CardDescription>
                  Recommended treatment plan generated by AI
                </CardDescription>
              </div>
              <Button
                variant={editingTreatment ? "default" : "outline"}
                size="sm"
                onClick={() => setEditingTreatment(!editingTreatment)}
                className="ml-auto transition-all duration-200"
              >
                {editingTreatment ? (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Treatment
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {editingTreatment ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedTreatment}
                    onChange={(e) => setEditedTreatment(e.target.value)}
                    placeholder="Enter treatment details..."
                    className="min-h-32 transition-all duration-200 focus:border-medical-primary"
                  />
                  <Button
                    onClick={handleSaveTreatment}
                    disabled={isSaving}
                    className="bg-medical-primary hover:bg-medical-secondary transition-all duration-200"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Treatment
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg animate-fadeIn">
                  <h3 className="font-medium text-lg mb-2 text-medical-primary">Treatment</h3>
                  <FormattedTreatment treatmentText={patient.treatment} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetails;