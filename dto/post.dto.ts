import { UserDTO } from "./user.dto";

export interface PostDTO {
    id: number;
    title: string;
    text: string;
    author: number;
    topic: number;
    date: Date;
    users: UserDTO
}

export interface CreatePostDTO {
    title: string;
    text: string;
    topic: string;
}