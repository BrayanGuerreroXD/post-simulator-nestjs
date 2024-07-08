import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CommentRequestDto {

    @IsNotEmpty({ message: 'Content is required'})
    @ApiProperty({ example: "This is a comment", type: String})
    content: string;

    @IsNotEmpty({ message: 'Post ID is required'})
    @IsNumber({}, { message: 'Post ID must be a number'})
    @ApiProperty({ example: 1, type: Number})
    postId: number;
}