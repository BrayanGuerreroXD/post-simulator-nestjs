import { Module } from "@nestjs/common";
import { PostsModule } from "src/modules/posts/posts.module";
import { MediatorPostsService } from "./mediator-posts.service";

@Module({
    imports: [PostsModule],
    providers: [MediatorPostsService],
    exports: [MediatorPostsService]
})
export class MediatorPostsModule {}