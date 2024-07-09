import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { PostsCommentsService } from "./posts.comments.service";
import { PostDTO } from "../posts/interfaces/post.dto";
import { ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { createErrorResponse } from "src/config/base.swagger.error.response.options";

@Controller()
@ApiTags('Posts Comments')
export class PostsCommentsController {
    constructor(private readonly postsCommentsService : PostsCommentsService) {}

    @ApiParam({ name: 'id', type: Number, description: 'Post ID', required: true })
    @ApiResponse({ status: 200, description: 'The reply has been successfully created', type: () => PostDTO })
    @ApiResponse(createErrorResponse(HttpStatus.NOT_FOUND, "Not Found - The post with the specified ID was not found", 'PostNotFoundException', ["Post not found"]))
    @Get('post-comments-replies/:id')
    @HttpCode(HttpStatus.OK)
    async getPostWithCommentsAndRepliesById(@Param('id') id: number) : Promise<PostDTO>{
        return await this.postsCommentsService.getPostWithCommentsAndRepliesById(id);
    }

}