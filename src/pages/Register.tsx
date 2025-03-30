import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please ensure both passwords are identical",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await registerDoctor(email, password, {
        name,
        email,
        specialization,
        clinicName,
        clinicAddress,
        phoneNumber,
      });
      
      toast({
        title: "Registration successful",
        description: "Your doctor account has been created",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please try logging in instead.";
      }
      
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-medical-light p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-medical-primary">Doctor Registration</CardTitle>
          <CardDescription>
            Create an account to manage your patients
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="specialization" className="text-sm font-medium">Specialization</label>
              <Input
                id="specialization"
                type="text"
                placeholder="Cardiology, Pediatrics, etc."
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="clinicName" className="text-sm font-medium">Clinic Name</label>
              <Input
                id="clinicName"
                type="text"
                placeholder="Smith Medical Center"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="clinicAddress" className="text-sm font-medium">Clinic Address</label>
              <Input
                id="clinicAddress"
                type="text"
                placeholder="123 Medical St, City"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-medical-primary hover:bg-medical-secondary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-medical-accent font-medium">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
