import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentRequestDto } from './dto/comment.request.dto.ts';
import { CommentResponseDto } from './dto/comment.response.dto';
import { Comment } from './entities/comment.entity';
import { plainToInstance } from 'class-transformer';
import { CommentNotFoundException } from 'src/exception-handler/exceptions.classes';
import { ReplyRequestDto } from './dto/reply.request.dto';
import { MediatorPostsService } from '../mediators/mediator-posts/mediator-posts.service';

@Injectable()
export class CommentsService {

    constructor(
        private readonly commentsRepository: CommentsRepository,
        private readonly mediatorPostsService : MediatorPostsService
    ) {}

    async create(body : CommentRequestDto) : Promise<CommentResponseDto> {
        const post = await this.mediatorPostsService.getPostEntityById(body.postId);
        const comment : Comment = new Comment();
        comment.content = body.content;
        comment.post = post;
        const createdComment = await this.commentsRepository.saveComment(comment);
        const commentResponseDto = plainToInstance(CommentResponseDto, createdComment, {
            excludeExtraneousValues: true,
            excludePrefixes: ['parent', 'replies'],
        });
        return commentResponseDto;
    }

    async reply(body: ReplyRequestDto) : Promise<CommentResponseDto> {
        const parentComment = await this.commentsRepository.getCommentById(body.commentId);
        if (!parentComment)
            throw new CommentNotFoundException();

        const comment : Comment = new Comment();
        comment.content = body.content;
        comment.post = parentComment.post;
        comment.parent = parentComment;

        const createdComment = await this.commentsRepository.saveComment(comment);
        const commentResponseDto = plainToInstance(CommentResponseDto, createdComment, {
            excludeExtraneousValues: true,
            excludePrefixes: ['post', 'replies'],
        });
        return commentResponseDto;
    }

    async getCommentById(id: number) : Promise<CommentResponseDto> {
        const comment = await this.commentsRepository.getCommentById(id);

        if (!comment)
            throw new CommentNotFoundException();

        const commentResponseDto = plainToInstance(CommentResponseDto, comment, {
            excludeExtraneousValues: true,
        });

        return commentResponseDto;
    }

    async getAllComments() : Promise<CommentResponseDto[]> {
        const comments = await this.commentsRepository.getAllComments();

        const commentsResponseDto = comments.map(comment => {
            return plainToInstance(CommentResponseDto, comment, {
                excludeExtraneousValues: true,
            });
        });

        return commentsResponseDto
    }

}
