import { Injectable } from "@nestjs/common"
import { Post } from "src/modules/posts/entities/post.entity";
import { PostsService } from "src/modules/posts/posts.service"

@Injectable()
export class MediatorPostsService {
    constructor(
        private readonly postsService: PostsService,
    ) {}

    async getPostEntityById(id: number) : Promise<Post> {
        return await this.postsService.getPostEntityById(id);
    }
}