import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const expenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  member: z.string().min(1, "Member is required"),
});

export const incomeSchema = z.object({
  source: z.string().min(1, "Income source is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
});

export const familySettingsSchema = z.object({
  familyName: z.string().min(1, "Family name is required"),
  currency: z.string().min(1, "Currency is required"),
  monthlyBudget: z.number().min(0, "Monthly budget must be 0 or greater"),
});

export const addMemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member"]).default("member"),
  spendingLimit: z.number().min(0, "Spending limit must be 0 or greater").optional().default(0),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type IncomeFormData = z.infer<typeof incomeSchema>;
export type FamilySettingsFormData = z.infer<typeof familySettingsSchema>;
export type AddMemberFormData = z.infer<typeof addMemberSchema>;
