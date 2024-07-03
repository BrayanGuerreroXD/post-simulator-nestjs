import { Injectable } from "@nestjs/common";
import { CommentsService } from "../comments/comments.service";
import { PostsService } from "../posts/posts.service";
import { PostDTO } from "../posts/interfaces/post.dto";
import { CommentDTO } from "../comments/interfaces/comment.dto";

@Injectable()
export class PostsCommentsService {
    constructor(
        private readonly postsService: PostsService,
        private readonly commentsService: CommentsService
    ) { }

    async getPostWithCommentsAndRepliesById(id: number) : Promise<PostDTO> {
        const post = await this.postsService.getPostById(id);
        const comments : CommentDTO[] = await this.commentsService.getCommentWithRepliesByPostId(id);

        const postDTO: PostDTO = {
            id: post.id,
            title: post.title,
            content: post.content,
            comments: comments,
        };

        return postDTO;
    }
}