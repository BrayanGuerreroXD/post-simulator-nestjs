import { Expose, Type } from "class-transformer";
import { CommentResponseDto } from "src/modules/comments/dto/comment.response.dto";

export class PostResponseDto {
    @Expose()
    id: number;

    @Expose()
    title: string;
    
    @Expose()
    content: string;
    
    @Expose()
    @Type(() => CommentResponseDto)
    comments: CommentResponseDto[];
}