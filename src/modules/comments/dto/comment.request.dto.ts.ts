import { IsNotEmpty, IsNumber } from "class-validator";

export class CommentRequestDto {

    @IsNotEmpty({ message: 'Content is required'})
    content: string;

    @IsNotEmpty({ message: 'Post ID is required'})
    @IsNumber({}, { message: 'Post ID must be a number'})
    postId: number;
}