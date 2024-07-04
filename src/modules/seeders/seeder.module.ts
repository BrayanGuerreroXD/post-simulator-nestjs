import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../modules/posts/entities/post.entity';
import { Comment } from '../../modules/comments/entities/comment.entity';
import { Seeder } from './seedder.';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment]),
    PostsModule,
    CommentsModule
  ],
  providers: [Seeder],
})
export class SeederModule {}
