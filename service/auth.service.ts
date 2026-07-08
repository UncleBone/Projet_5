import { LoginUserDTO, AuthResponse, UserDTO, RegisterDTO, RegisterSchema } from "@/dto/user.dto";
import { faker } from "@faker-js/faker";
import { UserRepo } from "@/repository/user.repo";
import * as bcrypt from 'bcrypt'
import { NextResponse } from "next/server";
import { createDecipheriv } from "crypto";

export class AuthService {
    private userRepo = new UserRepo;

    async login(credentials: LoginUserDTO): Promise<NextResponse> {
        const { login } = credentials;
        const pswd = credentials.password;
        const userByUsername = await this.userRepo.getUserByUsername(login);
        const userByEmail = await this.userRepo.getUserByEmail(login);
        const user = userByUsername || userByEmail;
        if(!user){
            throw({ status: 401, message: 'Identifiants invalides' })
        }
        const isPasswordValid = await bcrypt.compare(pswd, user.password);
        console.log(login, pswd, user, isPasswordValid)
    
        if (!isPasswordValid) {
            throw({ status: 401, message: 'Mot de passe incorrect' });
        }
        const token = faker.internet.jwt();
        const { password, ...userWithoutPassword } = user;
        const response = {...userWithoutPassword, token: token };
        
        return NextResponse.json(response)
    };

    async register(data: RegisterDTO): Promise<NextResponse> {
        const { username, email } = data;
        const pswd = data.password;
        if(!username || !email || !pswd){
            throw({ status: 400, message: "Veuillez remplir tous les champs" })
        }
        const userByUsername = await this.userRepo.getUserByUsername(username);
        if(userByUsername){
            throw({ status: 400, message: "Ce nom d'utilisateur existe déjà" })
        }
        const userByEmail = await this.userRepo.getUserByEmail(email);
        if(userByEmail){
            throw({ status: 400, message: "Cet email existe déjà" })
        }
        const parsed = RegisterSchema.parse(data);

        const hashedPassword = await bcrypt.hash(pswd, 10);
        const { password, ...newUser } = await this.userRepo.createUser({...parsed, password: hashedPassword});

        const token = faker.internet.jwt();
        const response = {...newUser, token: token };
        
        return NextResponse.json(response)
    };

    // updateCurrentUser: (updates: Partial<AuthResponse>): AuthResponse | null => {
    //     const userStr = localStorage.getItem('user');
    //     if (!userStr) {
    //     return null;
    //     }
    //     const existing = JSON.parse(userStr);
    //     const nextUser = { ...existing, ...updates };
    //     localStorage.setItem('user', JSON.stringify(nextUser));
    //     return nextUser;
    // },

    getToken(): string | null {
        return localStorage.getItem('token');
    };

    isAuthenticated(): boolean {
        if(!window) throw("window error")
        return !!window.localStorage.getItem('token');
    };
}