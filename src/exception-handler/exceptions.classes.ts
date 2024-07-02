import { NotFoundException } from "@nestjs/common";

class PostNotFoundException extends NotFoundException {
    constructor() {
        super('Post not found');
    }
}

class CommentNotFoundException extends NotFoundException {
    constructor() {
        super('Comment not found');
    }
}

export {
    PostNotFoundException,
    CommentNotFoundException
}