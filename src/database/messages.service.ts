import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UUID } from 'crypto';
import mongoose from 'mongoose';

import { User } from './schemas/user.schema';
import { Message } from './schemas/message.schema';
import { SocketsService } from 'src/socket/sockets.service';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Message.name) private MessageModel: Model<Message>,
    ) {}

    async sendKey(key: string, author: UUID, receiver: UUID, isRSAKey: boolean = true): Promise<Message> {
        const createdMessage = new this.MessageModel({
            type: isRSAKey ? "rsa_key" : "aes_key",
            author: author,
            receiver: receiver,
            content: key,
            datetime: Date.now() * 1000,
        });

        return await createdMessage.save();
    }

    async getKey(author: UUID, receiver: UUID, returnRsaKey: boolean = true ): Promise<Message | null> {
        const key = (await this.MessageModel.findOne({
            type: returnRsaKey ? "rsa_key" : "aes_key",
            author: author,
            receiver: receiver
        }));

        if (!key)
            return null;

        return key;
    }

    async deleteAllMessages(users: UUID[], deleteKeys: boolean = true): Promise<void> {
        await this.MessageModel.deleteMany({
            type: deleteKeys ? { $or: ["message", "aes_key", "rsa_key"] } : "message",
            $or: [
                { author: users[0], receiver: users[1] },
                { author: users[1], receiver: users[0] }
            ]
        });
    }

    async isConversationReady(users: UUID[]): Promise<Boolean> {
        const RSAKeysNumber = await this.MessageModel.countDocuments({
            type: "rsa_key",
            $or: [
                { author: users[0], receiver: users[1] },
                { author: users[1], receiver: users[0] }
            ]
        });

        const AESKeysNumber = await this.MessageModel.countDocuments({
            type: "aes_key",
            $or: [
                { author: users[0], receiver: users[1] },
                { author: users[1], receiver: users[0] }
            ]
        });

        return RSAKeysNumber === 1 && AESKeysNumber === 1;
    }

}