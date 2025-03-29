
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const { doctor, updateDoctorProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (doctor) {
      setName(doctor.name || '');
      setSpecialization(doctor.specialization || '');
      setClinicName(doctor.clinicName || '');
      setClinicAddress(doctor.clinicAddress || '');
      setPhoneNumber(doctor.phoneNumber || '');
    }
  }, [doctor]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateDoctorProfile({
        name,
        specialization,
        clinicName,
        clinicAddress,
        phoneNumber,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update profile information",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal and professional information
              </CardDescription>
            </div>
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-medical-primary text-white text-2xl">
                {name ? name.charAt(0).toUpperCase() : "D"}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. John Smith"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="specialization" className="text-sm font-medium">
                Specialization
              </label>
              <Input
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Cardiology, Pediatrics, etc."
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="clinicName" className="text-sm font-medium">
                Clinic Name
              </label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Smith Medical Center"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="clinicAddress" className="text-sm font-medium">
                Clinic Address
              </label>
              <Input
                id="clinicAddress"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="123 Medical St, City"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              className="ml-auto bg-medical-primary hover:bg-medical-secondary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
