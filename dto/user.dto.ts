import { z } from 'zod';

export const LoginSchema = z.object({
    login: z.string().min(2),
    password: z.string(),
});

export const RegisterSchema = z.object({
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .refine((val) => /[a-z]/.test(val), "Le mot de passe doit contenir au moins une lettre minuscule")
    .refine((val) => /[A-Z]/.test(val), "Le mot de passe doit contenir au moins une lettre majuscule")
    .refine((val) => /\d/.test(val), "Le mot de passe doit contenir au moins un chiffre")
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), "Le mot de passe doit contenir au moins un caractère spécial")
});

export type LoginUserDTO = z.infer<typeof LoginSchema>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;

export interface UserDTO {
    id: number;
    username: string;
    email: string;
}

export interface CreateUserDTO {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse extends UserDTO {
    token: string;
}