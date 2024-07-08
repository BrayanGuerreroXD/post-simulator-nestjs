import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength } from "class-validator";

export class PostRequestDto {
    @IsNotEmpty({ message: 'Title is required' })
    @MaxLength(50, { message: 'Title is too long' })
    @ApiProperty({ 
        example: "This is a post", 
        type: String, 
        description: "Post title (max 50 characters)",
        required: true
    })
    title: string;

    @IsNotEmpty({ message: 'Content is required' })
    @ApiProperty({ 
        example: "This is a post content", 
        type: String, 
        description: "Post content",
        required: true
    })
    content: string;
}
