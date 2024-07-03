import { Module } from "@nestjs/common";
import { PostsModule } from "../posts/posts.module";
import { CommentsModule } from "../comments/comments.module";
import { PostsCommentsService } from "./posts.comments.service";
import { PostsCommentsController } from "./posts.comments.controller";

@Module({
    imports: [
        PostsModule,
        CommentsModule
    ],
    controllers: [PostsCommentsController],
    providers: [PostsCommentsService],
})
export class PostsCommentsModule {}