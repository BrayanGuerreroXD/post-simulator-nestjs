import { ApiProperty } from "@nestjs/swagger";
import { CommentDTO } from "src/modules/comments/interfaces/comment.dto";

export class PostDTO {
    @ApiProperty({
        type: Number,
        description: 'Post ID',
        example: 1
    })
    id: number;

    @ApiProperty({ 
        type: String, 
        description: "Post title",
        example: "This is a post"
    })
    title: string;

    @ApiProperty({ 
        type: String, 
        description: "Post content",
        example: "This is a post content"
    })
    content: string;

    @ApiProperty({ 
        type: [CommentDTO], 
        description: "Post comments",
        isArray: true,
        example: [{
            id: 1,
            content: 'This is a comment',
            count: 0,
            firstReply: null
        }]
    })
    comments: CommentDTO[];
}