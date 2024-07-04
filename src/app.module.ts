import { Module } from '@nestjs/common';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ConfigModule } from '@nestjs/config';
import { DataSourceConfig } from './config/data.source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsCommentsModule } from './modules/posts-comments/posts.comments.module';
import { SeederModule } from './modules/seeders/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    TypeOrmModule.forRoot({...DataSourceConfig}),
    PostsModule, 
    CommentsModule,
    PostsCommentsModule,
    SeederModule
  ],
})
export class AppModule {}
