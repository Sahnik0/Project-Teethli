
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getPatientsByDoctor } from '@/lib/patientService';
import { Patient } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { FileText, Search, Loader2 } from 'lucide-react';

const Prescriptions = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const patientData = await getPatientsByDoctor(currentUser.uid);
        // Only show patients that have a diagnosis and treatment
        const patientsWithPrescriptions = patientData.filter(
          (patient) => patient.diagnosis && patient.treatment
        );
        setPatients(patientsWithPrescriptions);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load prescriptions",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [currentUser]);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPrescription = (patientId: string) => {
    navigate(`/dashboard/patient/${patientId}?tab=prescription`);
  };

  // Safe formatDate function that handles various date formats
  const formatDate = (date: Date | number | any): string => {
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
    
    return dateToFormat.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-medical-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
          <CardDescription>
            View and manage all patient prescriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prescriptions by patient name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredPatients.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.sex}</TableCell>
                      <TableCell>{formatDate(patient.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPrescription(patient.id)}
                          className="flex items-center"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No prescriptions found</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                {searchTerm
                  ? "No patients match your search criteria."
                  : "You haven't created any prescriptions yet."}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/dashboard/add-patient')} className="bg-medical-primary hover:bg-medical-secondary">
                  Add Patient
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Prescriptions;
