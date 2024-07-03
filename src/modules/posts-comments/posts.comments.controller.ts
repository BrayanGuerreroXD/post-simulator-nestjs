import { Controller, Get, Param } from "@nestjs/common";
import { PostsCommentsService } from "./posts.comments.service";
import { PostDTO } from "../posts/interfaces/post.dto";

@Controller()
export class PostsCommentsController {
    constructor(private readonly postsCommentsService : PostsCommentsService) {}

    @Get('post-comments-replies/:id')
    async getPostWithCommentsAndRepliesById(@Param('id') id: number) : Promise<PostDTO>{
        return await this.postsCommentsService.getPostWithCommentsAndRepliesById(id);
    }

}