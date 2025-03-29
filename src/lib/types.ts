
export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  clinicName?: string;
  clinicAddress?: string;
  phoneNumber?: string;
  createdAt: Date | number;
}

export interface Patient {
  id: string;
  doctorId: string;
  name: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  symptoms: string;
  diagnosisDescription: string;
  imageUrl?: string;
  imagePublicId?: string;
  diagnosis?: string;
  treatment?: string;
  createdAt: Date | number;
  updatedAt: Date | number;
  doctorName?: string;
  doctorSpecialization?: string;
  clinicName?: string;
  clinicAddress?: string;
}

export interface AuthState {
  user: null | {
    uid: string;
    email: string | null;
  };
  doctor: Doctor | null;
  loading: boolean;
  error: string | null;
}
