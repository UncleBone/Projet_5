import { CreateCommentDTO, CreatePostDTO } from "@/dto/post.dto";
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

    async create(userId: number, body: CreatePostDTO ) {
        await this.postService.create(userId, body)
    }

    async addComment(userId: number, body: CreateCommentDTO) {
        await this.postService.addComment(userId, body)
    }
}