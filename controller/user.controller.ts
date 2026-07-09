import { UserService } from "@/service/user.service";

export class UserController {
    private userService = new UserService;

    async getUserSubscriptions(userId: number) {
        return this.userService.getUserSubscriptions(userId)
    }

    async getUserInfo(userId: number) {
        return this.userService.getUserInfo(userId)
    }
}