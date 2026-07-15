import { CreateCommentDTO, CreateCommentSchema, CreatePostDTO, CreatePostSchema } from '@/dto/post.dto';
import { AuthResponse } from '@/dto/user.dto';
import { PostRepo } from '@/repository/post.repo';


export class PostService {
    private postRepo = new PostRepo;

    async getAll(user: AuthResponse) {
        const posts = await this.postRepo.getAll(user.id);
        return posts
    };

    async getById(id: number) {
        const post = await this.postRepo.getById(id);
        return post
    };

    async create(userId: number, body: CreatePostDTO) {
        const parsed = CreatePostSchema.parse(body);
        const data = {...parsed, topic: Number(body.topic), author: userId}
        await this.postRepo.create(data);
    };

    async addComment(userId: number, body: CreateCommentDTO) {
        const parsed = CreateCommentSchema.parse(body);
        const data = {...parsed, author: userId}
        await this.postRepo.createComment(data);
    };
}