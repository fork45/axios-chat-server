import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UUID } from "crypto";

import { Message } from "src/database/schemas/message.schema"
import { MessagesService as DatabaseMessagesService } from "src/database/messages.service";
import { MessageId } from "src/types/messages";
import { NoConversation } from "src/exceptions/NoConversation";
import { NoPermissionToDelete } from "src/exceptions/NoPermissionToDelete";
import { SocketsService } from "src/socket/sockets.service";
import { MessageNotFound } from "src/exceptions/MessageNotFound";

@Injectable()
export class MessagesService {
    
    constructor(
        @InjectModel(Message.name) private MessageModel: Model<Message>,
        private messages: DatabaseMessagesService,
        private sockets: SocketsService
    ) {}

    async sendMessage(author: UUID, receiver: UUID, content: string, iv: string): Promise<Message> {
        if (!(await this.messages.isConversationReady([author, receiver])))
            throw new NoConversation();
        
        const createdMessage = new this.MessageModel({
            type: "message",
            author: author,
            receiver: receiver,
            content: content,
            iv: iv,
            datetime: Date.now() * 1000,
        });

        return await createdMessage.save();
    }

    async getMessages(users: UUID[], limit: number = 50, after: MessageId = null, markAsRead: boolean = true): Promise<Message[]> {
        let query = {
            type: "message",
            $or: [
                { author: users[0], receiver: users[1] },
                { author: users[1], receiver: users[0] }
            ],
        }

        after ? query["datetime"] = { $gt: (await this.getMessageById(after)).datetime } : null

        const messages = await this.MessageModel.find(query).sort({ datetime: -1 }).limit(limit);
        if (markAsRead) 
            await this.markMessagesAsReadByMessages(messages)
        return messages;
    }

    async getMessageById(id: MessageId): Promise<Message> {
        const message = await this.MessageModel.findOne({
            type: "message",
            id: id
        });
        if (!message) 
            throw new MessageNotFound(id)
        
        return message;
    }

    async deleteMessages(requester: UUID, receiver: UUID, messagesIds: MessageId[]): Promise<void> {
        const messages = await this.MessageModel.find({
            type: "messages",
            id: { $in: messagesIds }
        });

        for await (const message of messages) {
            if (!message)
                throw new MessageNotFound(message.id);
            else if (message.author !== requester)
                throw new NoPermissionToDelete();
        }

        await this.MessageModel.deleteMany({
            type: "messages",
            id: { $in: messagesIds }
        });

        this.sockets.sockets[requester]?.emit("deleteMessages", messagesIds);
        this.sockets.sockets[receiver]?.emit("deleteMessages", messagesIds);
    }

    async markMessagesAsReadByIds(messagesIds: MessageId[], author: UUID, receiver: UUID): Promise<void> {
        await this.MessageModel.updateMany({
            type: "message",
            id: { $in: messagesIds },
            read: false,
            receiver: author
        }, {
            $set: { read: true }
        });

        this.sockets.sockets[author]?.emit("messagesRead", messagesIds);
        this.sockets.sockets[receiver]?.emit("messagesRead", messagesIds);
    }

    async markMessagesAsReadByMessages(messages: Message[]): Promise<void> {
        const author: UUID = messages[0].author;
        const receiver: UUID = messages[0].receiver;
        let ids: MessageId[];

        for await (const message of messages) {
            if (message.author === receiver) continue;
            
            ids.push(message.id);
            await message.updateOne({ $set: { read: true } })
        }

        this.sockets.sockets[author]?.emit("messagesRead", ids);
        this.sockets.sockets[receiver]?.emit("messagesRead", ids);
    }

}