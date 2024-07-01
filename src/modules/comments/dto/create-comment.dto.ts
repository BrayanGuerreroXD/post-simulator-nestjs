import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCommentDto {

    @IsNotEmpty({ message: 'Content is required'})
    content: string;

    @IsNotEmpty({ message: 'Post ID is required'})
    @IsNumber({}, { message: 'Post ID must be a number'})
    post_id: number;
}