import "next-auth";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    weight?: number;
    height?: number;
    activityLevel?: string;
    medicalConditions?: string[];
    allergies?: string[]; // Added allergies
    lastUpdateDate?: Date;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string;
      dateOfBirth?: Date;
      gender?: string;
      weight?: number;
      height?: number;
      activityLevel?: string;
      medicalConditions?: string[];
      allergies?: string[]; // Added allergies
      lastUpdateDate?: Date;
    };
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    weight?: number;
    height?: number;
    activityLevel?: string;
    medicalConditions?: string[];
    allergies?: string[]; // Added allergies
    lastUpdateDate?: Date;
  }
} 