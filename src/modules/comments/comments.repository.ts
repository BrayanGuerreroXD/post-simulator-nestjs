import { DataSource, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentDTO } from "./interfaces/comment.dto";

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

    // Get all responses to a comment and their count by implementing recursion
    async findCommentWithReplies(id: number): Promise<CommentDTO> {
        const query = `
            WITH RECURSIVE descendants AS (
                SELECT id, parent_id, content
                FROM public."comment"
                WHERE id = $1
                UNION ALL
                SELECT c.id, c.parent_id, c.content
                FROM public."comment" c
                INNER JOIN descendants d ON c.parent_id = d.id
            )
            SELECT * FROM descendants;
        `;
    
        const results = await this.query(query, [id]);
    
        if (!results || results.length === 0) {
            return null;
        }
    
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

    //  Get all responses to all comments by post_id and their count by implementing recursion
    async findCommentWithRepliesByPostId(postId: number): Promise<CommentDTO[]> {
        const comments = await this.repository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.parent', 'parent')            
            .where('comment.post_id = :postId', { postId })
            .getMany();

        if (!comments || comments.length === 0) {
            return [];
        }

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


}