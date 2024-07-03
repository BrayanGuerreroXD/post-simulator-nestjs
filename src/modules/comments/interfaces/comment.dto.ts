export interface CommentDTO {
    id: number;
    content: string;
    count: number;
    firstReply?: CommentDTO;
}