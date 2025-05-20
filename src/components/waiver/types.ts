
import { z } from "zod";

export const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  emergencyContact: z.string().min(2, { message: "Emergency contact is required" }),
  emergencyPhone: z.string().min(10, { message: "Emergency contact phone is required" }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms"
  }),
  additionalNotes: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;
