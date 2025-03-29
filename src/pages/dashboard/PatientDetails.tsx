
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPatient, deletePatient } from '@/lib/patientService';
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
import { toast } from '@/hooks/use-toast';
import { Printer, Trash, ArrowLeft, Loader2 } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/cloudinaryService';

const PatientDetails = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const { doctor } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') || 'prescription';

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        if (patientId) {
          const patientData = await getPatient(patientId);
          setPatient(patientData);
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
            margin: 15px 0;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            text-align: right;
            font-style: italic;
            color: #2D5986;
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
        printWindow.document.write('<html><head><title>Print Prescription</title>');
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-medical-primary mb-2">Patient Not Found</h2>
        <p className="text-gray-600 mb-6">The patient record you're looking for doesn't exist or has been removed.</p>
        <Button
          onClick={() => navigate('/dashboard/patients')}
          className="bg-medical-primary hover:bg-medical-secondary"
        >
          Back to Patients
        </Button>
      </div>
    );
  }

  // Safe formatDate function that handles various date formats
  const formatDate = (date: Date | number | any | undefined): string => {
    if (!date) return "N/A";
    
    let dateToFormat: Date;
    
    // Handle Firebase Timestamp objects
    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      dateToFormat = date.toDate();
    }
    // Handle numeric timestamps
    else if (typeof date === 'number') {
      dateToFormat = new Date(date);
    }
    // Handle Date objects
    else if (date instanceof Date) {
      dateToFormat = date;
    }
    // Handle string dates
    else if (typeof date === 'string') {
      dateToFormat = new Date(date);
    }
    else {
      console.error("Invalid date format:", date);
      return "Invalid Date";
    }
    
    // Check if the date is valid
    if (isNaN(dateToFormat.getTime())) {
      console.error("Invalid date value:", date);
      return "Invalid Date";
    }
    
    return dateToFormat.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get optimized image URL if available
  const getPatientImageUrl = () => {
    if (patient.imagePublicId) {
      return getOptimizedImageUrl(patient.imagePublicId);
    }
    return patient.imageUrl || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          className="flex items-center text-medical-primary" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Prescription
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
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
      
      <Card>
        <CardHeader>
          <CardTitle className="text-medical-primary">Patient Information</CardTitle>
          <CardDescription>
            Detailed information about {patient.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="text-lg font-semibold">{patient.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Age</h3>
                <p className="text-lg">{patient.age} years</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sex</h3>
                <p className="text-lg">{patient.sex}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                <p className="text-lg">{formatDate(patient.createdAt)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Symptoms</h3>
                <p className="text-md">{patient.symptoms}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Doctor's Initial Diagnosis</h3>
                <p className="text-md">{patient.diagnosisDescription}</p>
              </div>
              
              {(patient.imageUrl || patient.imagePublicId) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Medical Image</h3>
                  <img 
                    src={getPatientImageUrl()} 
                    alt="Medical image" 
                    className="mt-2 max-h-56 rounded-lg border"
                    onError={(e) => {
                      console.error("Image failed to load");
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="prescription">Generated Prescription</TabsTrigger>
          <TabsTrigger value="diagnosis">AI Diagnosis</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prescription">
          <Card>
            <CardHeader>
              <CardTitle>Medical Prescription</CardTitle>
              <CardDescription>
                AI-generated based on the patient information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={prescriptionRef} 
                className="bg-white p-6 rounded-lg border shadow-sm prescription"
              >
                <div className="header">
                  <div className="doctor-info">
                    <h1>Dr. {doctor?.name || "Medical Professional"}</h1>
                    <p>{doctor?.specialization || "General Practitioner"}</p>
                    <p>{doctor?.clinicName || "Medical Clinic"}</p>
                    <p>{doctor?.clinicAddress || ""}</p>
                  </div>
                  <div className="prescription-date">
                    <p><strong>Date:</strong> {formatDate(patient.createdAt)}</p>
                  </div>
                </div>
                
                <div className="patient-info">
                  <h2>Patient Information</h2>
                  <div className="patient-info-grid">
                    <div className="patient-info-item">
                      <p className="patient-info-label">Name:</p>
                      <p>{patient.name}</p>
                    </div>
                    <div className="patient-info-item">
                      <p className="patient-info-label">Age:</p>
                      <p>{patient.age} years</p>
                    </div>
                    <div className="patient-info-item">
                      <p className="patient-info-label">Sex:</p>
                      <p>{patient.sex}</p>
                    </div>
                    <div className="patient-info-item">
                      <p className="patient-info-label">Symptoms:</p>
                      <p>{patient.symptoms}</p>
                    </div>
                  </div>
                </div>
                
                {(patient.imageUrl || patient.imagePublicId) && (
                  <div className="medical-image-container">
                    <img 
                      src={getPatientImageUrl()} 
                      alt="Medical condition" 
                      className="medical-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x300?text=Image+Not+Available';
                      }}
                    />
                  </div>
                )}
                
                <div className="diagnosis-section">
                  <h2><span className="rx-symbol">℞</span> Diagnosis</h2>
                  <p>{patient.diagnosis}</p>
                </div>
                
                <div className="treatment-section">
                  <h2>Treatment Plan</h2>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {patient.treatment}
                  </div>
                </div>
                
                <div className="footer">
                  <p>Doctor's Signature: ____________________</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-medical-primary hover:bg-medical-secondary"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Prescription
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Diagnosis</CardTitle>
              <CardDescription>
                Diagnosis generated using Gemini API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium text-lg mb-2 text-medical-primary">Diagnosis</h3>
                <p className="whitespace-pre-line">{patient.diagnosis}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="treatment">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Plan</CardTitle>
              <CardDescription>
                Recommended treatment plan generated by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium text-lg mb-2 text-medical-primary">Treatment</h3>
                <div className="whitespace-pre-line">{patient.treatment}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetails;
