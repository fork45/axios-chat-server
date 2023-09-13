import {
    Controller,
    Post,
    Get,
    Body,
    Headers,
    HttpCode,
    Query
} from '@nestjs/common';
import { UUID } from 'crypto';

import { MessagesService } from 'src/database/messages.service';
import { UsersService } from 'src/database/users.service';
import { Token } from 'src/types/users';
import { ConversationExists } from 'src/exceptions/ConversationExists';
import { KeyMessage } from 'src/types/messages';
import { InvalidKey } from 'src/exceptions/InvalidKey';
import { ConversationNotReady } from 'src/exceptions/ConversationNotReady';
import { isValidPublicRsaKey } from 'src/utils/keys';
import { KeysService } from './keys.service';

@Controller('keys')
export class KeyController {
    
    constructor(
        private messages: MessagesService,
        private users: UsersService,
        private keys: KeysService
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
        else if (this.messages.getKey(author.id, user, false))
            
        
        
        if (!isValidPublicRsaKey(key))
            throw new InvalidKey();

        await this.messages.sendKey(key, author.id, user, true);
        await this.keys.encryptAESKey(author.id, key);
    }

    @Get(":user")
    async getKey(
        @Headers("Authorization") token: Token,
        @Body("user") user: UUID,
        @Query("key") key: "rsa" | "aes"
    ): Promise<KeyMessage> {
        let author = await this.users.getUserByToken(token);

        if (!await this.messages.isConversationReady([author.id, user]))
            throw new ConversationNotReady();

        return (await this.messages.getKey(author.id, user, key === "rsa")).publicData as KeyMessage;
    }

}
