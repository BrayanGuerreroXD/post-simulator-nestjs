import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class ReplyRequestDto {
    @IsNotEmpty({ message: 'Content is required'})
    @ApiProperty({ example: "This is a reply", type: String, description: "Reply content"})
    content: string;

    @IsNotEmpty({ message: 'Comment ID is required'})
    @IsNumber({}, { message: 'Comment ID must be a number'})
    @ApiProperty({ example: 1, type: Number, description: "Comment ID"})
    commentId: number;
}