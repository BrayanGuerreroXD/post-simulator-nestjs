import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentRequestDto } from './dto/comment.request.dto.ts';
import { CommentResponseDto } from './dto/comment.response.dto';
import { ReplyRequestDto } from './dto/reply.request.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('comment')
  async create(@Body() body : CommentRequestDto) : Promise<CommentResponseDto> {
    return await this.commentsService.create(body);
  }

  @Post('reply')
  async reply(@Body() body: ReplyRequestDto) : Promise<CommentResponseDto> {
    return await this.commentsService.reply(body);
  }

  @Get('comment/:id')
  async getCommentById(@Param('id') id: number) : Promise<CommentResponseDto> {
    return await this.commentsService.getCommentById(id);
  }
  
  @Get('comment/:id/replies')
  async getCommentWithRepliesById(@Param('id') id: number) : Promise<any> {
    return await this.commentsService.getCommentWithRepliesById(id);
  }

  @Get('comments')
  async getAllComments() : Promise<CommentResponseDto[]> {
    return await this.commentsService.getAllComments();
  }

}