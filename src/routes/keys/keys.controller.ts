import {
    Controller,
    Post,
    Get,
    Body,
    Headers,
    HttpCode
} from '@nestjs/common';
import { UUID, publicEncrypt } from 'crypto';

import { MessagesService } from 'src/database/messages.service';
import { UsersService } from 'src/database/users.service';
import { Token } from 'src/types/users';
import { ConversationExists } from 'src/exceptions/ConversationExists';
import { KeyMessage } from 'src/types/messages';
import { InvalidKey } from 'src/exceptions/InvalidKey';
import { ConversationNotReady } from 'src/exceptions/ConversationNotReady';

@Controller('keys')
export class KeyController {
    
    constructor(
        private messages: MessagesService,
        private users: UsersService
    ) {}

    @Post()
    @HttpCode(204)
    async sendKey(
        @Headers("Authorization") token: Token,
        @Body("user") user: UUID,
        @Body("key") key: string
    ): Promise<void> {
        let author = await this.users.getUserByToken(token);
        if (this.messages.isConversationReady([author.id, user]))
            throw new ConversationExists();

        try {
            publicEncrypt(key, Buffer.from(`qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567899100$@!#(),./;:[]{}|\<>?^&*_-=+"'`))
        } catch (error) {
            throw new InvalidKey();
        }

        await this.messages.sendKey(key, author.id, user);
    }

    @Get(":user")
    async getKey(
        @Headers("Authorization") token: Token,
        @Body("user") user: UUID
    ): Promise<KeyMessage> {
        let author = await this.users.getUserByToken(token);

        if (!await this.messages.isConversationReady([author.id, user]))
            throw new ConversationNotReady();

        return (await this.messages.getKey(author.id, user)).publicData as KeyMessage;
    }

}
