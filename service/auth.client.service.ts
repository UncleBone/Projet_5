import { AuthResponse } from "@/dto/user.dto";

export const authClientService = {

    login(data: AuthResponse) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser(): AuthResponse | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },
}