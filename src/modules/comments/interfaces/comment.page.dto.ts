import { CommentChildPageDto } from "./comment.child.page.dto";

export class CommentPageDto {
    id: number;
    content: string;
    count: number;
    firstReply?: CommentChildPageDto;
}