import { AuthResponse } from "@/dto/user.dto";
import { PostService } from "@/service/post.service";

export class PostController {
    private postService = new PostService;

    async getAll(user: AuthResponse) {
        return this.postService.getAll(user)
    }

    async getById(id: number) {
        return this.postService.getById(id)
    }
}