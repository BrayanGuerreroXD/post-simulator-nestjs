import { ApiProperty } from "@nestjs/swagger";

export class CommentDTO {
    @ApiProperty({ 
        type: Number, 
        description: 'Comment ID', 
        example: 1
    })
    id: number;

    @ApiProperty({ 
        type: String, 
        description: 'Comment content', 
        example: 'This is a comment'
    })
    content: string;

    @ApiProperty({ 
        type: Number, 
        description: 'Number of descendants', 
        example: 0
    })
    count: number;

    @ApiProperty({ 
        type: CommentDTO, 
        description: 'First reply',
        example: null
    })
    firstReply?: CommentDTO;
}