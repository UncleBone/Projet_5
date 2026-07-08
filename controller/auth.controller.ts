import { LoginUserDTO, RegisterDTO } from "@/dto/user.dto";
import { AuthService } from "@/service/auth.service";

export class AuthController {
    private authService = new AuthService;

    async login(body: LoginUserDTO) {
        return this.authService.login(body)
    }

    async register(body: RegisterDTO) {
        return this.authService.register(body)
    }
    
}