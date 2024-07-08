import { DataSource, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentDTO } from "./interfaces/comment.dto";
import { CommentPageDto } from "./interfaces/comment.page.dto";

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

    async getAllCommentsWithParentByPostId(postId: number): Promise<Comment[]> {
        return await this.repository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.parent', 'parent')            
            .where('comment.post_id = :postId', { postId })
            .getMany();
    }

    // Get all responses to a comment and their count by implementing recursion
    async findCommentWithReplies(id: number): Promise<any> {
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
    
        return await this.query(query, [id]);
    }

    async findAllReplyByCommentId(commentId: number): Promise<CommentDTO> {
        const results = await this.repository.query(
            `SELECT build_comment_tree(
                (WITH descendants AS (SELECT * FROM get_comment_descendants($1))
                SELECT jsonb_agg(row_to_json(descendants)) FROM descendants), $1
            ) AS comment_tree`, [commentId],
        );
        return results[0]?.comment_tree || null;
    }

    async findAllCommentsByPostId(postId: number): Promise<CommentDTO[]> {
        const results = await this.repository.query('SELECT * FROM get_comment_trees_by_post_id($1) AS comment_trees', [postId]);
        return results[0]?.comment_trees || [];
    }

    async findAllCommentChildrenByCommentIdAndPageAndLimit(commentId: number, page: number, limit: number): Promise<CommentPageDto[]> {
        const results = await this.repository.query('SELECT * FROM get_comment_tree_pagination_by_comment_id($1, $2, $3) AS children', [commentId, page, limit]);
        return results[0]?.children || [];
    }
    
    async findAllCommentsByPostIdAndPageAndLimit(postId: number, page: number, limit: number): Promise<CommentPageDto[]> {
        const results = await this.repository.query('SELECT * FROM get_comment_tree_pagination_by_post_id($1, $2, $3) AS comments', [postId, page, limit]);
        return results[0]?.comments || [];
    }

}