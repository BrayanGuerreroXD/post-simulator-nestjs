import { Post } from "./entities/post.entity";
import { Comment } from "../comments/entities/comment.entity";
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

export class PostsRepository extends Repository<Post> {

    constructor(
        @InjectRepository(Post)
        private repository: Repository<Post>,
        private readonly dataSource: DataSource
    ) {
        super(
            repository.target,
            repository.manager,
            repository.queryRunner,
        );
    }

    async createPost(post: Post): Promise<Post> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const createdPost = await queryRunner.manager.save(post);
            await queryRunner.commitTransaction();
            return createdPost;
        } catch (err) {
            if (queryRunner.isTransactionActive)
                await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getPosts(): Promise<Post[]> {
        return this.repository.find();
    }
    
    async getPostById(id: number): Promise<Post> {
        const post = await this.repository.createQueryBuilder('post')
            .where('post.id = :id', { id })
            .getOne();
        return post;
    }

    async postExists(id: number): Promise<boolean> {
        return await this.repository.createQueryBuilder('post')
            .where('post.id = :id', { id })
            .getCount() > 0;
    }

    async deletePost(id: number): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.delete(Post, id);
            await queryRunner.commitTransaction();
        } catch (err) {
            if (queryRunner.isTransactionActive)
                await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}