import { IsNotEmpty, MaxLength } from "class-validator";

export class PostRequestDto {
    @IsNotEmpty({ message: 'Title is required' })
    @MaxLength(50, { message: 'Title is too long' })
    title: string;

    @IsNotEmpty({ message: 'Content is required' })
    content: string;
}
