export interface CreateUserDTO {
    username: string;
    email: string;
    password: string;
}

export interface LoginUserDTO {
    login: string;
    password: string;
}

export interface UserDTO {
    id: number;
    username: string;
    email: string;
}

export interface AuthResponse extends UserDTO {
    token: string;
}