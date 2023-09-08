import { Controller, Post, Get, Body, Headers, HttpCode} from '@nestjs/common';
import { MessagesService } from 'src/database/messages.service';
import { UUID } from 'crypto';
import { UsersService } from 'src/database/users.service';
import { Token } from 'src/types/users';
import { ConversationExists } from 'src/exceptions/ConversationExists';
import { NoConversation } from 'src/exceptions/NoConversation';

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
        @Body("user") key: string
    ): Promise<void> {
        let author = await this.users.getUserByToken(token);
        if (this.messages.isConversationReady([author.id, user]))
            throw new ConversationExists();
        

        await this.messages.sendKey(key, author.id, user);
    }

    @Get(":user")
    async getKey(
        @Headers("Authorization") token: Token,
        @Body("user") user: UUID
    ): Promise<{ key: string }> {
        let author = await this.users.getUserByToken(token);

        if (!(await this.messages.isConversationReady([author.id, user])))
            throw new NoConversation();

        return { key: await this.messages.getKey(author.id, user) };
    }
}
