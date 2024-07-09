import { Controller, Get, Post, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentRequestDto } from './dto/comment.request.dto.ts';
import { CommentResponseDto } from './dto/comment.response.dto';
import { ReplyRequestDto } from './dto/reply.request.dto';
import { PageDto } from 'src/config/base.page.dto';
import { CommentPageDto } from './interfaces/comment.page.dto';
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { PostResponseDto } from '../posts/dto/post.response.dto';
import { CommentDTO } from './interfaces/comment.dto';
import { createErrorResponse } from 'src/config/base.swagger.error.response.options';

@Controller()
@ApiTags('Comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiBody({ type: () => CommentRequestDto, description: 'Comment request to create a new comment', required: true })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The comment has been successfully created', 
    schema: {
      type: 'object',
        properties: {
          id: { type: 'numnber', example: 1 },
          content: { type: 'string', example: 'This is a comment' },
          post: { type: 'object', $ref: getSchemaPath(PostResponseDto), example: { id: 1, title: 'This is a post', content: 'This is a post content' } },
          parent: { type: 'object', example: null },
          replies: { type: 'array', example: [] }
        }
    }
  })
  @ApiResponse(createErrorResponse(HttpStatus.BAD_REQUEST, "Bad Request - Caused by an incorrect request object", 'BadRequestException', ["Content is required"]))
  @Post('comment')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body : CommentRequestDto) : Promise<CommentResponseDto> {
    return await this.commentsService.create(body);
  }

  @ApiBody({ type: () => ReplyRequestDto, description: 'Reply request to create a new reply to a comment', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'The reply has been successfully created', type: () => CommentResponseDto })
  @ApiResponse(createErrorResponse(HttpStatus.BAD_REQUEST, "Bad Request - Caused by an incorrect request object", 'BadRequestException', ["Content is required"]))
  @ApiResponse(createErrorResponse(HttpStatus.NOT_FOUND, "Not Found - The parent comment with the specified ID was not found", 'CommentNotFoundException', ["Comment not found"]))
  @Post('reply')
  @HttpCode(HttpStatus.OK)
  async reply(@Body() body: ReplyRequestDto) : Promise<CommentResponseDto> {
    return await this.commentsService.reply(body);
  }

  @ApiParam({ name: 'id', type: Number, description: 'Comment ID', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Get a comment by ID', type: () => CommentResponseDto })
  @ApiResponse(createErrorResponse(HttpStatus.NOT_FOUND, "Not Found - The parent comment with the specified ID was not found", 'CommentNotFoundException', ["Comment not found"]))
  @Get('comment/:id')
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Param('id') id: number) : Promise<CommentResponseDto> {
    return await this.commentsService.getCommentById(id);
  }

  @ApiResponse({ 
    status: 200, 
    description: 'Get all comments', 
    type: [CommentResponseDto],
    example: [{
      id: 1,
      content: 'This is a comment',
      post: { id: 1, title: 'This is a post', content: 'This is a post content' },
      parent: null,
      replies: []
    }]
  })
  @Get('comments')
  async getAllComments() : Promise<CommentResponseDto[]> {
    return await this.commentsService.getAllComments();
  }

  @ApiParam({ name: 'id', type: Number, description: 'Comment ID', required: true })
  @ApiResponse({ status: 200, description: 'Get a comment by ID', type: () => CommentDTO })
  @ApiResponse(createErrorResponse(HttpStatus.NOT_FOUND, "Not Found - The parent comment with the specified ID was not found", 'CommentNotFoundException', ["Comment not found"]))
  @Get('comment/:id/replies')
  @HttpCode(HttpStatus.OK)
  async getCommentWithRepliesById(@Param('id') id: number) : Promise<CommentDTO> {
    return await this.commentsService.getCommentWithRepliesById(id);
  }

  @ApiParam({ name: 'comment_id', type: Number, description: 'Comment ID', required: true })
  @ApiQuery({ name: 'page', type: Number, description: 'Page number', required: true })
  @ApiQuery({ name: 'limit', type: Number, description: 'Number of items per page', required: true })
  @ApiResponse({ 
    status: 200, 
    description: 'Get comment children by comment ID paginated', 
    type: () => PageDto<CommentPageDto>,
    example: {
      data: [{
        id: 1,
        content: 'This is a comment',
        count: 0,
        firstReply: null
      }],
      count: 1,
    }
  })
  @ApiResponse(createErrorResponse(HttpStatus.NOT_FOUND, "Not Found - The parent comment with the specified ID was not found", 'CommentNotFoundException', ["Comment not found"]))
  @Get('children-by-comment-id/:comment_id/paginate')
  @HttpCode(HttpStatus.OK)
  async getCommentChildrenPaginate(
      @Param('comment_id') commentId: number,
      @Query('page') page: number,
      @Query('limit') limit: number,
  ): Promise<PageDto<CommentPageDto>> {
      return await this.commentsService.getCommentChildrenPaginate(commentId, page, limit);
  }  

  @ApiParam({ name: 'post_id', type: Number, description: 'Post ID', required: true })
  @ApiQuery({ name: 'page', type: Number, description: 'Page number', required: true })
  @ApiQuery({ name: 'limit', type: Number, description: 'Number of items per page', required: true })
  @ApiResponse({ 
    status: 200, 
    description: 'Get comment root by post ID paginated', 
    type: () => PageDto<CommentPageDto>,
    example: {
      data: [{
        id: 1,
        content: 'This is a comment',
        count: 0,
        firstReply: null
      }],
      count: 1,
    }
  })
  @ApiResponse(createErrorResponse(HttpStatus.NOT_FOUND, "Not Found - The post with the specified ID was not found", 'PostNotFoundException', ["Post not found"]))
  @Get('comments-by-post-id/:post_id/paginate')
  @HttpCode(HttpStatus.OK)
  async getCommentsPaginate(
      @Param('post_id') postId: number,
      @Query('page') page: number,
      @Query('limit') limit: number,
  ): Promise<PageDto<CommentPageDto>> {
      return await this.commentsService.getCommentsPaginate(postId, page, limit);
  }  

}