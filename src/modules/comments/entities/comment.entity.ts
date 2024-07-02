import { Post } from "../../../modules/posts/entities/post.entity";
import { BaseEntity } from "../../../config/base.entity";
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";

@Entity()
export class Comment extends BaseEntity {
    @Column({
        nullable: false,
    })
    content: string;

    @ManyToOne(() => Post, { nullable: false, onDelete: 'CASCADE'})
    @JoinColumn({ name: "post_id" })
    post: Post;

    @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE'})
    @JoinColumn({ name: "parent_id" })
    parent: Comment;

    @OneToMany(() => Comment, comment => comment.parent)
    replies: Comment[];
  
}