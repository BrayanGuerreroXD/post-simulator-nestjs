import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Post } from '../../modules/posts/entities/post.entity';
import { Comment } from '../../modules/comments/entities/comment.entity';
import { PostsRepository } from '../posts/posts.repository';
import { CommentsRepository } from '../comments/comments.repository';

@Injectable()
export class Seeder {
    constructor(
        private readonly postRepository: PostsRepository,
        private readonly commentRepository: CommentsRepository
    ) {}

    async run() {
        await this.createPostsWithComments();
    }

    private async createPostsWithComments() {
        const post = new Post();
        let title = faker.lorem.sentence();
        if (title.length > 50)
            title = title.substring(0, 50);
        post.title = title;
        post.content = faker.lorem.paragraphs(2);
        await this.postRepository.save(post);

        for (let j = 0; j < 1000; j++) {
            const comment = await this.createComment(post, null);
            await this.createReplies(comment, 1);
        }
    }

    private async createComment(post: Post, parent: Comment | null): Promise<Comment> {
        const comment = new Comment();
        comment.content = faker.lorem.sentence();
        comment.post = post;
        comment.parent = parent;
        return this.commentRepository.save(comment);
    }

    private async createReplies(parent: Comment, level: number) {
        if (level > 2) return;
        const numberOfReplies = faker.datatype.number({ min: 1, max: 50 });
        for (let i = 0; i < numberOfReplies; i++) {
            const reply = await this.createComment(parent.post, parent);
            await this.createReplies(reply, level + 1);
        }
    }
}
