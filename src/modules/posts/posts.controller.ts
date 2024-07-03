import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostResponseDto } from './dto/post.response.dto';
import { PostRequestDto } from './dto/post.request.dto';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('post')
  @HttpCode(201)
  async create(@Body() createPostDto: PostRequestDto) : Promise<PostResponseDto> {
    return await this.postsService.create(createPostDto);
  }

  @Put('post/:id')
  @HttpCode(200)
  async update(@Param('id') id: number, @Body() updatePostDto: PostRequestDto) : Promise<PostResponseDto> {
    return await this.postsService.update(id, updatePostDto);
  }

  @Get('posts')
  @HttpCode(200)
  async findAll(): Promise<PostResponseDto[]> {
    return await this.postsService.getPosts();
  }

  @Get('post/:id')
  @HttpCode(200)
  async findOne(@Param('id') id: number): Promise<any> {
    return await this.postsService.getPostById(id);
  }

  @Delete('post/:id')
  @HttpCode(200)
  async remove(@Param('id') id: number): Promise<void> {
    await this.postsService.remove(id);
  }

}