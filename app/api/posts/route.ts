import { PostController } from '@/controller/post.controller'

const controller = new PostController;

export async function GET() {
    return controller.getAll()
}