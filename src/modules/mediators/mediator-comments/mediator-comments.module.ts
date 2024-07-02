import { Module } from "@nestjs/common";
import { CommentsModule } from "src/modules/comments/comments.module";
import { MediatorCommentsService } from "./mediator-comments.service";

@Module({
    imports: [CommentsModule],
    providers: [MediatorCommentsService],
    exports: [MediatorCommentsService]
})
export class MediatorCommentsModule {}