import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentsRepository } from './comments.repository';
import { PostsModule } from '../posts/posts.module';
import { MediatorPostsModule } from '../mediators/mediator-posts/mediator-posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    MediatorPostsModule
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsService]
})
export class CommentsModule {}
