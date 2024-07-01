import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../../config/base.entity";
import { Comment } from "../../../modules/comments/entities/comment.entity";

@Entity('posts')
export class Post extends BaseEntity {
    @Column({ 
        nullable: false,
        length: 50
    })
    title: string;

    @Column({
        nullable: false
    })
    content: string;   

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];
}