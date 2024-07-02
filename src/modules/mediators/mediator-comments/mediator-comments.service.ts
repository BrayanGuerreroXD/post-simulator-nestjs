import { Injectable } from "@nestjs/common";
import { CommentsService } from "src/modules/comments/comments.service";

@Injectable()
export class MediatorCommentsService {
    constructor(
        private readonly commentsService: CommentsService,
    ) { }

}