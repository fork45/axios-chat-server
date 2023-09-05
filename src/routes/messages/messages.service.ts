import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message } from "src/database/schemas/message.schema"
import { MessagesService as DatabaseMessagesService } from "src/database/messages.service";

import { UUID } from "crypto";
import { MessageId } from "src/types/messages";
import { NoConversation } from "src/exceptions/NoConversation";
import { NoPermissionToDelete } from "src/exceptions/NoPermissionToDelete";

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Message.name) private MessageModel: Model<Message>,
        private messages: DatabaseMessagesService
    ) {}

    async sendMessage(type: string, author: UUID, receiver: UUID, content: string) {
        if (!(await this.messages.isConversationReady([author, receiver])))
            throw new NoConversation();
        

        const createdMessage = new this.MessageModel({
            type: type,
            author: author,
            receiver: receiver,
            content: content,
            datetime: Date.now() * 1000,
        });

        return createdMessage.save();
    }

    async getMessages(users: UUID[], limit: number = 50, after: string = null) {
        let query = {
            type: "message",
            $or: [
                { author: users[0], receiver: users[1] },
                { author: users[1], receiver: users[0] }
            ],
        }

        after ? query["datetime"] = { $gt: (await this.getMessageById(after)).datetime } : null

        return await this.MessageModel.find(query).sort({ datetime: -1 }).limit(limit);
    }

    async getMessageById(id: string) {
        return await this.MessageModel.findOne({ id: id });
    }

    async deleteMessages(requester: UUID, messagesIds: MessageId[]) {
        const messages = await this.MessageModel.find({
            type: "messages",
            id: { $in: messagesIds }
        });

        for (const message of messages) {
            if (message.author !== requester)
                throw new NoPermissionToDelete();
                return;
        }

        await this.MessageModel.deleteMany({
            type: "messages",
            id: { $in: messagesIds }
        });
    }
}