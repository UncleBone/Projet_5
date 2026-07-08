import { PostService } from "@/service/post.service";

export class PostController {
    private postService = new PostService;

    async getAll() {
        return this.postService.getAll()
    }
}