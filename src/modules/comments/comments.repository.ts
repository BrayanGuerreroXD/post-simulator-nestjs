import { DataSource, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { InjectRepository } from "@nestjs/typeorm";

export class CommentsRepository extends Repository<Comment> {
    constructor(
        @InjectRepository(Comment)
        private repository: Repository<Comment>,
        private readonly dataSource: DataSource
    ) {
        super(
            repository.target,
            repository.manager,
            repository.queryRunner,
        );
    }

    async saveComment(comment: Comment): Promise<Comment> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const createdComment = await queryRunner.manager.save(comment);
            await queryRunner.commitTransaction();
            return createdComment;
        } catch (e) {
            if (queryRunner.isTransactionActive)
                await queryRunner.rollbackTransaction();
            throw e;
        } finally {
            await queryRunner.release();
        }
    }

    async getCommentById(id: number): Promise<Comment> {
        return await this.repository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.post', 'post')
            .where('comment.id = :id', { id })
            .getOne();
    }

    async getAllComments(): Promise<Comment[]> {
        return await this.repository.find({
            relations: ['post', 'parent'],
        });
    }

    async commentExists(id: number): Promise<boolean> {
        return await this.repository.createQueryBuilder('comment')
            .where('comment.id = :id', { id })
            .getCount() > 0;
    }


}