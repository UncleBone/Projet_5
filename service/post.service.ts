import db from '@/data/mockDB'
import { AuthResponse } from '@/dto/user.dto';
import { PostRepo } from '@/repository/post.repo';
import { NextResponse } from 'next/server'


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

    
    
    
    // getPostComments(id: number) {
    //     const comments = db.comments;
    //     return comments.reduce<number[]>((acc,c) => {
    //         if(c.p_id === id) {
    //             acc.push(c.id)
    //         }
    //         return acc
    //     }, [])
    // };

    // getPostsByTopic(t_id: number) {
    //     const posts = db.posts.reduce<number[]>((acc,p) => {
    //         if(p.topic === t_id) {
    //             acc.push(p.id)
    //         }
    //         return acc
    //     }, [])

    //     return posts
    // }
}