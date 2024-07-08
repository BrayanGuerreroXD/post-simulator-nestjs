import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { PostsCommentsService } from "./posts.comments.service";
import { PostDTO } from "../posts/interfaces/post.dto";
import { ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller()
@ApiTags('Posts Comments')
export class PostsCommentsController {
    constructor(private readonly postsCommentsService : PostsCommentsService) {}

    @ApiParam({
        name: 'id',
        type: Number,
        description: 'Post ID',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'The reply has been successfully created', 
        type: () => PostDTO
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found - The post with the specified ID was not found',
        schema: {
          type: 'object',
            properties: {
              message: {
                type: 'array',
                items: { type: 'string', example: 'Post not found'}
              },
              error: { type: 'string', example: 'PostNotFoundException'},
              status: { type: 'number', example: 404},
              date: { type: 'string', example: new Date().toISOString()}
            }
        }
      })
    @Get('post-comments-replies/:id')
    @HttpCode(HttpStatus.OK)
    async getPostWithCommentsAndRepliesById(@Param('id') id: number) : Promise<PostDTO>{
        return await this.postsCommentsService.getPostWithCommentsAndRepliesById(id);
    }

}