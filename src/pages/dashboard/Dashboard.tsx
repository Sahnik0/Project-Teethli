
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPatientsByDoctor } from '@/lib/patientService';
import { Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleUserRound, FileText, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { doctor } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (doctor?.id) {
          const patientData = await getPatientsByDoctor(doctor.id);
          setPatients(patientData);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctor]);

  const recentPatients = patients.slice(0, 5);
  
  // Filter patients created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const patientsToday = patients.filter(patient => {
    const patientDate = new Date(patient.createdAt);
    patientDate.setHours(0, 0, 0, 0);
    return patientDate.getTime() === today.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-medical-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              {patientsToday.length} new today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-medical-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentPatients.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent medical records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
            <CircleUserRound className="h-4 w-4 text-medical-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-bold truncate">{doctor?.name || "Doctor"}</div>
            <p className="text-xs text-muted-foreground truncate">
              {doctor?.specialization || "Medical Professional"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent Patients</TabsTrigger>
          <TabsTrigger value="today">Today's Patients</TabsTrigger>
        </TabsList>
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patient Records</CardTitle>
              <CardDescription>
                Your most recent patient consultations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medical-primary"></div>
                </div>
              ) : recentPatients.length > 0 ? (
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-medical-primary/10 flex items-center justify-center">
                          <CircleUserRound className="h-5 w-5 text-medical-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.sex}, {patient.age} years
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/patient/${patient.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No patients records yet</p>
                  <Button
                    className="mt-4 bg-medical-primary hover:bg-medical-secondary"
                    onClick={() => navigate('/dashboard/add-patient')}
                  >
                    Add Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Patients</CardTitle>
              <CardDescription>
                Patients you've added today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medical-primary"></div>
                </div>
              ) : patientsToday.length > 0 ? (
                <div className="space-y-4">
                  {patientsToday.map((patient) => (
                    <div key={patient.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-medical-primary/10 flex items-center justify-center">
                          <CircleUserRound className="h-5 w-5 text-medical-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.sex}, {patient.age} years
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/patient/${patient.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No patients added today</p>
                  <Button
                    className="mt-4 bg-medical-primary hover:bg-medical-secondary"
                    onClick={() => navigate('/dashboard/add-patient')}
                  >
                    Add Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
