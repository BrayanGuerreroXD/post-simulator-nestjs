import { IsNotEmpty, IsNumber } from "class-validator";

export class ReplyRequestDto {
    @IsNotEmpty({ message: 'Content is required'})
    content: string;

    @IsNotEmpty({ message: 'Comment ID is required'})
    @IsNumber({}, { message: 'Comment ID must be a number'})
    commentId: number;
}