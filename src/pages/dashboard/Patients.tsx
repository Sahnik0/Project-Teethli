
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getPatientsByDoctor, searchPatients } from '@/lib/patientService';
import { Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Search, PlusCircle, Loader2, MapPin } from 'lucide-react';

const Patients = () => {
  const { doctor } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (doctor?.id) {
          const patientData = await getPatientsByDoctor(doctor.id);
          setPatients(patientData);
          setFilteredPatients(patientData);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load patients",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctor]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    setIsSearching(true);
    try {
      if (doctor?.id) {
        const results = await searchPatients(doctor.id, searchTerm);
        setFilteredPatients(results);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to search patients",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Improved formatDate function that handles various date formats
  const formatDate = (date: Date | number | any): string => {
    if (!date) return "N/A";
    
    let dateToFormat: Date;
    
    try {
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
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "Error";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Teethli Patients</CardTitle>
              <CardDescription>Manage your patient records</CardDescription>
            </div>
            <Button 
              className="bg-medical-primary hover:bg-medical-secondary transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/dashboard/add-patient')}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search patients by name..."
                className="pl-8 transition duration-200 hover:border-medical-primary focus:border-medical-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              variant="outline"
              className="transition-transform duration-200 hover:scale-105"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medical-primary"></div>
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="rounded-md border animate-fade-in">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient, index) => (
                    <TableRow 
                      key={patient.id} 
                      className="hover:bg-medical-light/30 transition-colors duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.sex}</TableCell>
                      <TableCell>
                        {patient.address ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="w-3 h-3 mr-1 text-medical-primary" />
                            <span className="truncate max-w-[150px]">{patient.address}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(patient.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/patient/${patient.id}`)}
                          className="hover:text-medical-primary transition-colors duration-200"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 animate-fade-in">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No patients found matching your search." : "No patients added yet."}
              </p>
              {!searchTerm && (
                <Button
                  className="bg-medical-primary hover:bg-medical-secondary transition-all duration-300 hover:scale-105"
                  onClick={() => navigate('/dashboard/add-patient')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Patient
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Patients;