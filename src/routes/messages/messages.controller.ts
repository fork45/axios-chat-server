import {
    Controller,
    Post,
    Patch,
    Get,
    Delete,
    HttpCode,
    Body,
    Query,
    Headers,
    Param
} from '@nestjs/common';
import { UUID } from 'crypto';

import { UsersService } from 'src/database/users.service';
import { MessagesService as DatabaseMessagesService } from 'src/database/messages.service';
import { MessageId } from 'src/types/messages';
import { Token } from 'src/types/users';
import { NoConversation } from 'src/exceptions/NoConversation';
import { NoPermissionToEdit } from 'src/exceptions/NoPermissionToEdit';
import { NoPermissionToDelete } from 'src/exceptions/NoPermissionToDelete';
import { MessagesService } from './messages.service';
import { MessageNotFound } from 'src/exceptions/MessageNotFound';
import { InvalidLimit } from 'src/exceptions/InvalidLimit';
import { Message } from "src/types/messages";

@Controller('messages')
export class MessagesController {

    constructor(
        private database: DatabaseMessagesService,
        private messages: MessagesService,
        private users: UsersService
    ) {}

    @Post()
    @HttpCode(200)
    async createMessage(
        @Headers("Authorization") token: Token,
        @Body("user") user: UUID,
        @Body("content") content: string
    ): Promise<Message> {
        let requester = await this.users.getUserByToken(token);

        if (!(await this.database.isConversationReady([requester.id, user])))
            throw new NoConversation();

        return (await this.messages.sendMessage("message", requester.id, user, content)).publicData;
    }

    @Post(":user/bulk")
    @HttpCode(204)
    async deleteMessages(
        @Headers("Authorization") token: Token,
        @Param("user") user: UUID,
        @Body("messages") messagesIds: MessageId[]
    ): Promise<void> {
        let requester = await this.users.getUserByToken(token);

        if (requester.conversationsWith.includes(user))
            throw new NoConversation();

        else if (messagesIds.length < 2 || messagesIds.length >= 100)

        await this.messages.deleteMessages(requester.id, user, messagesIds);
    }

    @Patch()
    @HttpCode(204)
    async editMessage(
        @Headers("Authorization") token: Token,
        @Body("message") messageId: MessageId,
        @Body("content") content: string,
    ): Promise<void> {
        let requester = await this.users.getUserByToken(token);
        let message = await this.messages.getMessageById(messageId)
        
        if (requester.id !== message.author)
            throw new NoPermissionToEdit();

        await message.updateOne({
            $set: {
                content: content,
                editDatetime: new Date().getTime() / 1000
            }
        });
    }

    @Get(":user")
    async getMessages(
        @Headers("Authorization") token: Token,
        @Param("user") user: UUID,
        @Query("limit") limit: number | null,
        @Query("after") after: MessageId | null
    ): Promise<Message[]> {
        let requester = await this.users.getUserByToken(token);

        if (limit < 2 || limit > 100)
            throw new InvalidLimit();
        
        const messages = await this.messages.getMessages([requester.id, user], limit ? limit : 50, after);
        return Promise.all(messages.map(message => message.publicData));;
    }

    @Get(":message")
    async getMessage(
        @Headers("Authorization") token: Token,
        @Param("message") messageId: MessageId,
    ): Promise<Message> {
        let requester = await this.users.getUserByToken(token);
        let message = await this.messages.getMessageById(messageId);

        if (requester.id !== message.author || requester.id !== message.receiver)
            throw new MessageNotFound();
        

        return message.publicData;
    }
    
    @Delete(":message")
    @HttpCode(204)
    async deleteMessage(
        @Headers("Authorization") token: Token,
        @Param("message") messageId: MessageId,
    ): Promise<void> {
        let requester = await this.users.getUserByToken(token);
        let message = await this.messages.getMessageById(messageId);

        if (requester.id !== message.author)
            throw new NoPermissionToDelete();

        await message.deleteOne();
    }
    
}