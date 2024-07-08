import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CommentResponseDto } from "src/modules/comments/dto/comment.response.dto";

export class PostResponseDto {
    @Expose()
    @ApiProperty({ 
        example: 1, 
        type: Number, 
        description: "Post ID"
    })
    id: number;

    @Expose()
    @ApiProperty({ 
        example: "This is a post", 
        type: String, 
        description: "Post title"
    })
    title: string;
    
    @Expose()
    @ApiProperty({ 
        example: "This is a post content", 
        type: String, 
        description: "Post content"
    })
    content: string;
    
    @Expose()
    @Type(() => CommentResponseDto)
    @ApiProperty({ 
        type: () => [CommentResponseDto], 
        description: "Post comments", 
        isArray: true,
        example: []
    })
    comments: CommentResponseDto[];
}