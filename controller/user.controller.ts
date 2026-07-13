import { RegisterDTO } from "@/dto/user.dto";
import { UserService } from "@/service/user.service";

export class UserController {
    private userService = new UserService;

    async getUserSubscriptions(userId: number) {
        return this.userService.getUserSubscriptions(userId)
    }

    async getUserInfo(userId: number) {
        return this.userService.getUserInfo(userId)
    }

    async addSubscription(userId: number, topicId: number) {
        this.userService.addSubscription(userId,topicId)
    }

    async removeSubscription(userId: number, topicId: number) {
        this.userService.removeSubscription(userId,topicId)
    }

    async update(userId: number,body: RegisterDTO) {
        return this.userService.update(userId,body)
    }
}