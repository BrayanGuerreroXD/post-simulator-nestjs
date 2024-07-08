import { ApiProperty } from "@nestjs/swagger";

export class CommentChildPageDto {
    @ApiProperty({ example: 1, type: Number})
    id: number;

    @ApiProperty({ example: "This is a comment", type: String})
    content: string;
}