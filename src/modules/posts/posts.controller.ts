import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostResponseDto } from './dto/post.response.dto';
import { PostRequestDto } from './dto/post.request.dto';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiBody({ 
    type: () => PostRequestDto, 
    description: 'Post request to create a new post'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The post has been successfully created', 
    type: () => PostResponseDto 
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Caused by an incorrect request object',
    schema: {
      type: 'object',
        properties: {
          message: {
            type: 'array',
            items: { type: 'string', example: 'Title is required'}
          },
          error: { type: 'string', example: 'Bad Request'},
          status: { type: 'number', example: 400},
          date: { type: 'string', example: new Date().toISOString()}
        }
    }
  })
  @Post('post')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: PostRequestDto) : Promise<PostResponseDto> {
    return await this.postsService.create(createPostDto);
  }

  @ApiParam({
    name: 'id', 
    type: Number, 
    description: 'Post ID'
  })
  @ApiBody({ 
    type: () => PostRequestDto, 
    description: 'Post request to update a post'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The post has been successfully updated', 
    type: () => PostResponseDto 
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Caused by an incorrect request object',
    schema: {
      type: 'object',
        properties: {
          message: {
            type: 'array',
            items: { type: 'string', example: 'Title is required'}
          },
          error: { type: 'string', example: 'Bad Request'},
          status: { type: 'number', example: 400},
          date: { type: 'string', example: new Date().toISOString()}
        }
    }
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
  @Put('post/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: number, @Body() updatePostDto: PostRequestDto) : Promise<PostResponseDto> {
    return await this.postsService.update(id, updatePostDto);
  }

  @ApiResponse({ 
    status: 200, 
    description: 'List of all posts', 
    type: [PostResponseDto], 
    example: [{
      id: 1,
      title: 'This is a post',
      content: 'This is a post content',
    }]
  })
  @Get('posts')
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<PostResponseDto[]> {
    return await this.postsService.getPosts();
  }

  @ApiParam({
    name: 'id', 
    type: Number, 
    description: 'Post ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The post has been successfully deleted', 
    type: null
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
  @Delete('post/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: number): Promise<void> {
    await this.postsService.remove(id);
  }

}