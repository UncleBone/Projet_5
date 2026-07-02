import { LoginUserDTO, AuthResponse, UserDTO } from "@/dto/user.dto";
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
        const { login, password } = credentials;
        const user = await users.find(u => (u.username === login || u.email === login) && u.password === password );
        console.log(user)
        if(!user){
            throw("wrong credentials")
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
        return !!localStorage.getItem('token');
    },
}