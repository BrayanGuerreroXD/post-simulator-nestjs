import { ApiProperty } from "@nestjs/swagger";
import { CommentChildPageDto } from "./comment.child.page.dto";

export class CommentPageDto {
    @ApiProperty({ example: 1, type: Number, description: "Comment ID"})
    id: number;

    @ApiProperty({ example: "This is a comment", type: String, description: "Comment content"})
    content: string;

    @ApiProperty({ example: 1, type: Number, description: "Comment replies count"})
    count: number;

    @ApiProperty({ type: () => CommentChildPageDto, description: "First reply object"})
    firstReply?: CommentChildPageDto;
}