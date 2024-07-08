import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentRequestDto } from './dto/comment.request.dto.ts';
import { CommentResponseDto } from './dto/comment.response.dto';
import { ReplyRequestDto } from './dto/reply.request.dto';
import { PageDto } from 'src/config/base.page.dto';
import { CommentPageDto } from './interfaces/comment.page.dto';

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

  @Get('children-by-comment-id/:comment_id/paginate')
  async getCommentChildrenPaginate(
      @Param('comment_id') commentId: number,
      @Query('page') page: number,
      @Query('limit') limit: number,
  ): Promise<PageDto<CommentPageDto>> {
      return await this.commentsService.getCommentChildrenPaginate(commentId, page, limit);
  }  

  @Get('comments-by-post-id/:post_id/paginate')
  async getCommentsPaginate(
      @Param('post_id') postId: number,
      @Query('page') page: number,
      @Query('limit') limit: number,
  ): Promise<PageDto<CommentPageDto>> {
      return await this.commentsService.getCommentsPaginate(postId, page, limit);
  }  

}