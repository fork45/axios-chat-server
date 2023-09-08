import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AccountController } from './routes/account/account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './database/schemas/user.schema';
import { Message, MessageSchema } from './database/schemas/message.schema';
import { MeController } from './routes/me/me.controller';
import { LoginController } from './routes/login/login.controller';
import { ConversationsController } from './routes/conversations/conversations.controller';
import { KeyController } from './routes/keys/keys.controller';
import { MessagesController } from './routes/messages/messages.controller';
import { AvatarsController } from './routes/avatars/avatars.controller';
import { UsersService } from './database/users.service';
import { MessagesService } from './database/messages.service';
import { SocketsService } from './socket/sockets.service';
import { TokenMiddleware } from './middlewares/TokenMiddleware';
import { StorageService } from './storage/storage.service';
import { MessagesService as RouteMessagesService } from './routes/messages/messages.service';
import { MeService } from './routes/me/me.service';
import { LoginService } from './routes/login/login.service';
import { AccountService } from './routes/account/account.service';
import { APP_FILTER } from '@nestjs/core';
import { MongoErrorFilter, MongoServerErrorFilter } from './routes/account/account.filters';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.mongodbConnectUri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])
    ],
    controllers: [
        AccountController,
        MeController,
        LoginController,
        ConversationsController,
        KeyController,
        MessagesController,
        AvatarsController
    ],
    providers: [
        UsersService,
        MessagesService,
        SocketsService,
        StorageService,
        RouteMessagesService,
        MeService,
        LoginService,
        AccountService,
        {provide: APP_FILTER, useClass: MongoErrorFilter},
        {provide: APP_FILTER, useClass: MongoServerErrorFilter}
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TokenMiddleware).exclude("/account", "/login").forRoutes('*');
    }
}
