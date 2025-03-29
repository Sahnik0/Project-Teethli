
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AuthState, Doctor } from '../lib/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  register: (email: string, password: string, doctorData: Omit<Doctor, 'id' | 'createdAt'>) => Promise<void>;
  registerDoctor: (email: string, password: string, doctorData: Omit<Doctor, 'id' | 'createdAt'>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDoctorProfile: (doctorData: Partial<Omit<Doctor, 'id' | 'createdAt' | 'email'>>) => Promise<void>;
  currentUser: AuthState['user'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    doctor: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const doctorRef = doc(db, 'doctors', user.uid);
          const doctorSnap = await getDoc(doctorRef);
          
          if (doctorSnap.exists()) {
            const doctorData = {
              id: doctorSnap.id,
              ...doctorSnap.data()
            } as Doctor;
            
            setAuthState({
              user: {
                uid: user.uid,
                email: user.email
              },
              doctor: doctorData,
              loading: false,
              error: null
            });
          } else {
            setAuthState({
              user: {
                uid: user.uid,
                email: user.email
              },
              doctor: null,
              loading: false,
              error: null
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAuthState({
            user: {
              uid: user.uid,
              email: user.email
            },
            doctor: null,
            loading: false,
            error: "Failed to load doctor data"
          });
        }
      } else {
        setAuthState({
          user: null,
          doctor: null,
          loading: false,
          error: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (
    email: string, 
    password: string, 
    doctorData: Omit<Doctor, 'id' | 'createdAt'>
  ) => {
    try {
      // Check if a doctor account with this email already exists
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create doctor document in Firestore
      await setDoc(doc(db, 'doctors', user.uid), {
        ...doctorData,
        email: user.email,
        createdAt: serverTimestamp()
      });
      
      // Update auth state
      setAuthState({
        user: {
          uid: user.uid,
          email: user.email
        },
        doctor: {
          id: user.uid,
          ...doctorData,
          email: user.email || '',
          createdAt: new Date()
        },
        loading: false,
        error: null
      });
      
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "Registration failed";
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  const registerDoctor = register;

  const login = async (email: string, password: string) => {
    try {
      // First authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Then check if there's a corresponding doctor document
      const doctorRef = doc(db, 'doctors', user.uid);
      const doctorSnap = await getDoc(doctorRef);
      
      if (doctorSnap.exists()) {
        const doctorData = {
          id: doctorSnap.id,
          ...doctorSnap.data()
        } as Doctor;
        
        setAuthState({
          user: {
            uid: user.uid,
            email: user.email
          },
          doctor: doctorData,
          loading: false,
          error: null
        });
      } else {
        // Create a doctor document if it doesn't exist but the user does
        // This helps handle cases where Firebase Auth exists but Firestore document doesn't
        await setDoc(doc(db, 'doctors', user.uid), {
          name: 'Doctor',
          email: user.email,
          createdAt: serverTimestamp()
        });
        
        const newDoctorData = {
          id: user.uid,
          name: 'Doctor',
          email: user.email || '',
          createdAt: new Date()
        } as Doctor;
        
        setAuthState({
          user: {
            uid: user.uid,
            email: user.email
          },
          doctor: newDoctorData,
          loading: false,
          error: null
        });
        
        toast({
          title: "Welcome",
          description: "Your doctor profile has been created. Please update your information.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = error.message || "Login failed";
      
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password";
      }
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        doctor: null,
        loading: false,
        error: null
      });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      const errorMessage = error.message || "Logout failed";
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  const updateDoctorProfile = async (doctorData: Partial<Omit<Doctor, 'id' | 'createdAt' | 'email'>>) => {
    try {
      if (!authState.user) {
        throw new Error("User not authenticated");
      }
      
      const doctorRef = doc(db, 'doctors', authState.user.uid);
      await updateDoc(doctorRef, {
        ...doctorData,
        updatedAt: serverTimestamp()
      });
      
      if (authState.doctor) {
        setAuthState({
          ...authState,
          doctor: {
            ...authState.doctor,
            ...doctorData
          }
        });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      const errorMessage = error.message || "Profile update failed";
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      toast({
        variant: "destructive",
        title: "Profile update failed",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  const value = {
    ...authState,
    register,
    registerDoctor,
    login,
    logout,
    updateDoctorProfile,
    currentUser: authState.user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
