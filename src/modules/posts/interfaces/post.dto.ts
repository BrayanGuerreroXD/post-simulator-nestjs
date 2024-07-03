import { CommentDTO } from "src/modules/comments/interfaces/comment.dto";

export interface PostDTO {
    id: number;
    title: string;
    content: string;
    comments: CommentDTO[];
}