import { TopicDTO } from "./topic.dto";
import { UserDTO } from "./user.dto";
import { z } from 'zod';

export const CreatePostSchema = z.object({
    title: z.string().min(1,"Le titre doit comporter au moins un caractère"),
    text: z.string().min(10, "Le texte doit comporter au moins 10 caractères"),
    topic: z.string().min(1,"Vous devez sélectionner un thème")
});

export const CreateCommentSchema = z.object({
    post_id: z.number(),
    text: z.string().min(1,"Le texte doit comporter au moins un caractère")
});

export type CreatePostDTO = z.infer<typeof CreatePostSchema>;
export type CreateCommentDTO = z.infer<typeof CreateCommentSchema>;

export interface CreatePostWithAuthor { 
    title: string;
    text: string;
    author: number;
    topic: number; 
} 

export interface CreateCommentWithAuthor { 
    post_id: number;
    text: string;
    author: number;
} 

export interface PostDTO {
    id: number;
    title: string;
    text: string;
    author: number;
    topic: number;
    date: Date;
    users: UserDTO
}

export interface CommentDTO {
    id: number;
    author: number;
    date: Date;
    post_id: number;
    text: string;
    users: UserDTO
}

export interface FullPostDTO extends PostDTO {
    topics: TopicDTO;
    comments: Array<CommentDTO>
}
