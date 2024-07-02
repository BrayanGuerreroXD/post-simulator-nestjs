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
            .leftJoinAndSelect('post.comments', 'comments', 'comments.parent IS NULL')
            .where('post.id = :id', { id })
            .getOne();

        if (post) {
            post.comments = await this.loadNestedComments(post.comments);
        }

        return post;
    }

    private async loadNestedComments(comments: Comment[]): Promise<Comment[]> {
        for (const comment of comments) {
            // Carga los comentarios hijos de cada comentario
            comment.replies = await this.dataSource.getRepository(Comment).createQueryBuilder('comment')
                .leftJoinAndSelect('comment.replies', 'replies')
                .where('comment.parent = :id', { id: comment.id })
                .getMany();
            // Llama recursivamente para cargar los hijos de los hijos
            comment.replies = await this.loadNestedComments(comment.replies);
        }

        return comments;
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