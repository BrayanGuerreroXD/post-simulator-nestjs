import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateReplyDto {
    @IsNotEmpty({ message: 'Content is required'})
    content: string;

    @IsNotEmpty({ message: 'Post ID is required'})
    @IsNumber({}, { message: 'Post ID must be a number'})
    post_id: number;

    @IsNotEmpty({ message: 'Root ID is required'})
    @IsNumber({}, { message: 'Root ID must be a number'})
    root_id: number;
}