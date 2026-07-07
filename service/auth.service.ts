import { LoginUserDTO, AuthResponse, UserDTO, CreateUserDTO } from "@/dto/user.dto";
import db from '@/data/mockDB'
import { faker } from "@faker-js/faker";

export const authService = {
    // login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    //     const response = await api.post<AuthResponse>('/auth/login', credentials);
    //     if (response.data.token) {
    //         localStorage.setItem('token', response.data.token);
    //         localStorage.setItem('user', JSON.stringify(response.data));
    //     }
    //     return response.data;
    // },
    login: async (credentials: LoginUserDTO): Promise<AuthResponse> => {
        const users = db.users;
        console.log(users)
        const { login, password } = credentials;
        const user = await users.find(u => (u.username === login || u.email === login) && u.password === password );
        if(!user){
            throw("identifiants incorrects")
        }
        const token = faker.internet.jwt();
        const response = {...user, token: token };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response));
        return response;
    },

    // register: async (data: RegisterData): Promise<AuthResponse> => {
    //     const response = await api.post<AuthResponse>('/auth/register', data);
    //     if (response.data.token) {
    //     localStorage.setItem('token', response.data.token);
    //     localStorage.setItem('user', JSON.stringify(response.data));
    //     }
    //     return response.data;
    // },
    register: async (data: CreateUserDTO): Promise<AuthResponse> => {
        const users = db.users;
        const { username, email, password } = data;
        if(!username || !email || !password){
            throw("Veuillez remplir tous les champs")
        }
        const checkUsername = await users.find(u => u.username === username);
        if(checkUsername){
            throw("Ce nom d'utilisateur est déjà pris")
        }
        const checkEmail = await users.find(u => u.email === email);
        if(checkEmail){
            throw("Cet email existe déjà")
        }
        let id = 1;
        let checkId = null;
        do{ 
            id++;
            checkId = users.find(u => u.id === id)    
        }while(checkId)
            const user = { id, username, email, password };
        users.push(user);
        const token = faker.internet.jwt();
        const response = {...user, token: token };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response));
        return response;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: (): UserDTO | null => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

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

    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    isAuthenticated: (): boolean => {
        if(!window) throw("window error")
        return !!window.localStorage.getItem('token');
    },
}