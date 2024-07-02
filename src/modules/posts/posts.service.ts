import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostResponseDto } from './dto/post.response.dto';
import { Post } from './entities/post.entity';
import { plainToInstance } from 'class-transformer';
import { PostNotFoundException } from 'src/exception-handler/exceptions.classes';
import { PostRequestDto } from './dto/post.request.dto';
import { MediatorCommentsService } from '../mediators/mediator-comments/mediator-comments.service';

@Injectable()
export class PostsService {

    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly mediatorCommentsService: MediatorCommentsService
    ) {}
    
    async create(body: PostRequestDto) : Promise<PostResponseDto> {
        const post: Post = plainToInstance(Post, body);
        const createdPost = await this.postsRepository.createPost(post);
        const postResponseDto = plainToInstance(PostResponseDto, createdPost, {
            excludeExtraneousValues: true,
        });
        return postResponseDto;
    }

    async update(id: number, body: PostRequestDto) : Promise<PostResponseDto> {
        const postExists = await this.postsRepository.postExists(id);

        if (!postExists)
            throw new PostNotFoundException();

        const post: Post = plainToInstance(Post, body);
        post.id = id;

        const updatedPost = await this.postsRepository.save(post);

        const postResponseDto = plainToInstance(PostResponseDto, updatedPost, {
            excludeExtraneousValues: true,
            excludePrefixes: ['comments'],
        });

        return postResponseDto
    }

    async getPosts(): Promise<PostResponseDto[]> {
        const posts = await this.postsRepository.getPosts();
        return posts.map(post => plainToInstance(PostResponseDto, post, {
            excludeExtraneousValues: true,
        }));
    }

    async getPostById(id: number): Promise<PostResponseDto> {
        const post = await this.postsRepository.getPostById(id);

        if (!post)
            throw new PostNotFoundException();

        return plainToInstance(PostResponseDto, post, {
            excludeExtraneousValues: true,
        });
    }

    async getPostEntityById(id: number): Promise<Post> {
        const post = await this.postsRepository.getPostById(id);
        if (!post)
            throw new PostNotFoundException();
        return post;
    }

    async remove(id: number): Promise<void> {
        const postExists = await this.postsRepository.postExists(id);

        if (!postExists)
            throw new PostNotFoundException();

        await this.postsRepository.deletePost(id);
    }

    async postExists(id: number): Promise<boolean> {
        return await this.postsRepository.postExists(id);
    }
}
