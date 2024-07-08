import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { PostResponseDto } from "src/modules/posts/dto/post.response.dto";

export class CommentResponseDto {
    @Expose()
    @ApiProperty({ 
        example: 2, 
        type: Number, 
        description: "Comment ID"
    })
    id: number;

    @Expose()
    @ApiProperty({ 
        example: "This is a comment", 
        type: String, 
        description: "Comment content"
    })
    content: string;
    
    @Expose()
    @Type(() => PostResponseDto)
    @ApiProperty({ 
        type: () => PostResponseDto, 
        example: {
            id: 1,
            title: "This is a post",
            content: "This is a post content",
        },
        description: "Post object"
    })
    post: PostResponseDto;

    @Expose()
    @Type(() => CommentResponseDto)
    @ApiProperty({ 
        type: () => CommentResponseDto,
        example: {
            id: 1,
            content: "This is a parent comment",
        }, 
        description: "Parent comment object",
    })
    parent: CommentResponseDto;

    @Expose()
    @Type(() => CommentResponseDto)
    @ApiProperty({ 
        type: () => [CommentResponseDto], 
        example: [],
        description: "Child comments", 
        isArray: true
    })
    replies: CommentResponseDto[];
}