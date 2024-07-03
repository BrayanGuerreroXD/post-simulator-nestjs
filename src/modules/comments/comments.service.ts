import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentRequestDto } from './dto/comment.request.dto.ts';
import { CommentResponseDto } from './dto/comment.response.dto';
import { Comment } from './entities/comment.entity';
import { plainToInstance } from 'class-transformer';
import { CommentNotFoundException } from 'src/exception-handler/exceptions.classes';
import { ReplyRequestDto } from './dto/reply.request.dto';
import { PostsService } from '../posts/posts.service';
import { CommentDTO } from './interfaces/comment.dto';

@Injectable()
export class CommentsService {

    constructor(
        private readonly commentsRepository: CommentsRepository,
        private readonly postsService : PostsService
    ) {}

    async create(body : CommentRequestDto) : Promise<CommentResponseDto> {
        const post = await this.postsService.getPostById(body.postId);
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

    // Get all responses to a comment and their count by implementing recursion
    async getCommentWithRepliesById(id: number) : Promise<CommentDTO> {
        const results = await this.commentsRepository.findCommentWithReplies(id);
    
        if (!results || results.length === 0)
            return null;
    
        const mapComments = (comments: any[], parentId = null): CommentDTO => {
            const comment = comments.find(c => c.id === parentId);
            if (!comment) return null;
    
            const children = comments.filter(c => c.parent_id === comment.id);
            const firstReply = children.length > 0 ? mapComments(comments, children[0].id) : null;
    
            return {
                id: comment.id,
                content: comment.content,
                count: children.length + children.reduce((acc, child) => acc + mapComments(comments, child.id).count, 0),
                firstReply: firstReply
            };
        };
    
        return mapComments(results, id);
    }

    // Get all responses to all comments by post_id and their count by implementing recursion
    async getCommentWithRepliesByPostId(postId: number) : Promise<CommentDTO[]> {
        const comments = await this.commentsRepository.getAllCommentsWithParentByPostId(postId);
        
        if (!comments || comments.length === 0)
            return [];

        const mapComments = (comments: any[], parentId = null): CommentDTO => {
            const comment = comments.find(c => c.id === parentId);
            if (!comment) return null;
    
            const children = comments.filter(c => (c?.parent?.id ?? null) === comment.id);
            const firstReply = children.length > 0 ? mapComments(comments, children[0].id) : null;
    
            return {
                id: comment.id,
                content: comment.content,
                count: children.length + children.reduce((acc, child) => acc + mapComments(comments, child.id).count, 0),
                firstReply: firstReply
            };
        };

        const rootComments = comments.filter(c => !c.parent);
        return rootComments.map(root => mapComments(comments, root.id));
    }




    // async getCommentWithRepliesById(id: number) : Promise<CommentDTO> {
    //     const comment = await this.commentsRepository.findCommentWithReplies(id);
    //     return comment;
    // }

    // async getCommentWithRepliesByPostId(postId: number) : Promise<CommentDTO[]> {
    //     const comments = await this.commentsRepository.findCommentWithRepliesByPostId(postId);
    //     return comments;
    // }

}
