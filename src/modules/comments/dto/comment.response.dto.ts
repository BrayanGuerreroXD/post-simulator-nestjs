import { Expose, Type } from "class-transformer";
import { PostResponseDto } from "src/modules/posts/dto/post.response.dto";

export class CommentResponseDto {
    @Expose()
    id: number;

    @Expose()
    content: string;
    
    @Expose()
    @Type(() => PostResponseDto)
    post: PostResponseDto;

    @Expose()
    @Type(() => CommentResponseDto)
    parent: CommentResponseDto;

    @Expose()
    @Type(() => CommentResponseDto)
    replies: CommentResponseDto[];
}