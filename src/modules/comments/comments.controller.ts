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

@Controller()
@ApiTags('Comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiBody({ 
    type: () => CommentRequestDto, 
    description: 'Comment request to create a new comment'
  })
  @ApiResponse({ 
    status: 201, 
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
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Caused by an incorrect request object',
    schema: {
      type: 'object',
        properties: {
          message: {
            type: 'array',
            items: { type: 'string', example: 'Content is required'}
          },
          error: { type: 'string', example: 'Bad Request'},
          status: { type: 'number', example: 400},
          date: { type: 'string', example: new Date().toISOString()}
        }
    }
  })
  @Post('comment')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body : CommentRequestDto) : Promise<CommentResponseDto> {
    return await this.commentsService.create(body);
  }

  @ApiBody({ 
    type: () => ReplyRequestDto, 
    description: 'Reply request to create a new reply to a comment'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The reply has been successfully created', 
    type: () => CommentResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Caused by an incorrect request object',
    schema: {
      type: 'object',
        properties: {
          message: {
            type: 'array',
            items: { type: 'string', example: 'Content is required'}
          },
          error: { type: 'string', example: 'Bad Request'},
          status: { type: 'number', example: 400},
          date: { type: 'string', example: new Date().toISOString()}
        }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - The parent comment with the specified ID was not found',
    schema: {
      type: 'object',
        properties: {
          message: {
            type: 'array',
            items: { type: 'string', example: 'Comment not found'}
          },
          error: { type: 'string', example: 'CommentNotFoundException'},
          status: { type: 'number', example: 404},
          date: { type: 'string', example: new Date().toISOString()}
        }
    }
  })
  @Post('reply')
  @HttpCode(HttpStatus.OK)
  async reply(@Body() body: ReplyRequestDto) : Promise<CommentResponseDto> {
    return await this.commentsService.reply(body);
  }

  @ApiParam({
    name: 'id', 
    type: Number, 
    description: 'Comment ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Get a comment by ID', 
    type: () => CommentResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - The comment with the specified ID was not found',
    schema: {
      type: 'object',
        properties: {
          message: {
            type: 'array',
            items: { type: 'string', example: 'Comment not found'}
          },
          error: { type: 'string', example: 'CommentNotFoundException'},
          status: { type: 'number', example: 404},
          date: { type: 'string', example: new Date().toISOString()}
        }
    }
  })
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

  @ApiParam({
    name: 'id', 
    type: Number, 
    description: 'Comment ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Get a comment by ID', 
    type: () => CommentDTO
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - The comment with the specified ID was not found',
    schema: {
      type: 'object',
        properties: {
          message: {
            type: 'array',
            items: { type: 'string', example: 'Comment not found'}
          },
          error: { type: 'string', example: 'CommentNotFoundException'},
          status: { type: 'number', example: 404},
          date: { type: 'string', example: new Date().toISOString()}
        }
    }
  })
  @Get('comment/:id/replies')
  @HttpCode(HttpStatus.OK)
  async getCommentWithRepliesById(@Param('id') id: number) : Promise<CommentDTO> {
    return await this.commentsService.getCommentWithRepliesById(id);
  }

  @ApiParam({
    name: 'comment_id', 
    type: Number, 
    description: 'Comment ID',
    required: true
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Page number',
    required: true
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Number of items per page',
    required: true
  })
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
  @ApiResponse({
    status: 404,
    description: 'Not Found - The comment with the specified ID was not found',
    schema: {
      type: 'object',
        properties: {
          message: {
            type: 'array',
            items: { type: 'string', example: 'Comment not found'}
          },
          error: { type: 'string', example: 'CommentNotFoundException'},
          status: { type: 'number', example: 404},
          date: { type: 'string', example: new Date().toISOString()}
        }
    }
  })
  @Get('children-by-comment-id/:comment_id/paginate')
  @HttpCode(HttpStatus.OK)
  async getCommentChildrenPaginate(
      @Param('comment_id') commentId: number,
      @Query('page') page: number,
      @Query('limit') limit: number,
  ): Promise<PageDto<CommentPageDto>> {
      return await this.commentsService.getCommentChildrenPaginate(commentId, page, limit);
  }  

  @ApiParam({
    name: 'post_id', 
    type: Number, 
    description: 'Post ID',
    required: true
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Page number',
    required: true
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Number of items per page',
    required: true
  })
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