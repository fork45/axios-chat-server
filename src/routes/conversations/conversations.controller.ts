import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Headers,
    Body,
    HttpCode
} from '@nestjs/common';
import { UUID, publicEncrypt } from 'crypto';

import { MessagesService } from 'src/database/messages.service';
import { UsersService } from 'src/database/users.service';
import { ConversationUser, PublicUser, Token } from 'src/types/users';
import { ConversationsService } from './conversations.service';
import { NoConversation } from 'src/exceptions/NoConversation';
import { ConversationExists } from 'src/exceptions/ConversationExists';
import { ConversationNotReady } from 'src/exceptions/ConversationNotReady';
import { InvalidKey } from 'src/exceptions/InvalidKey';

@Controller('conversations')
export class ConversationsController {

    constructor(
        private messages: MessagesService,
        private users: UsersService,
        private conversations: ConversationsService
    ) {}

    @Get()
    async getConversations(
        @Headers("Authorization") token: Token
    ): Promise<ConversationUser[]> {
        return this.conversations.getConversations((await this.users.getUserByToken(token)).id);
    }

    @Get(":user")
    async getUser(
        @Headers("Authorization") token: Token,
        @Param("user") user: UUID
    ): Promise<ConversationUser> {
        let requester = await this.users.getUserByToken(token);

        if (!await this.messages.isConversationReady([requester.id, user]))
            throw new ConversationNotReady();
        
        return (await this.conversations.getConversation(requester.id, user));
    }

    @Post()
    @HttpCode(204)
    async createConversation(
        @Headers("Authorization") token: Token, 
        @Body("user") user: string,
        @Body("key") key: string
    ): Promise<void> {
        let author = await this.users.getUserByToken(token);
        let receiver = await this.users.getUserByName(user);

        if (receiver.conversationsWith.includes(author.id))
            throw new ConversationExists();

        try {
            publicEncrypt(key, Buffer.from(`qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567899100$@!#(),./;:[]{}|\<>?^&*_-=+"'`))
        } catch (error) {
            throw new InvalidKey();
        }

        await this.conversations.createConversation([author.id, receiver.id]);
        await this.messages.sendKey(key, author.id, receiver.id);
    }

    @Delete(":user")
    @HttpCode(204)
    async deleteConversation(
        @Headers("Authorization") token: Token,
        @Param("user") user: UUID
    ) {
        let author = await this.users.getUserByToken(token);

        if (!author.conversationsWith.includes(user))
            throw new NoConversation();

        await this.conversations.deleteConversation([author.id, user]);
        await this.messages.deleteAllMessages([author.id, user]);
    }
    
};