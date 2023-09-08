import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Message } from './schemas/message.schema';
import { UUID } from 'crypto';
import { MessageId } from 'src/types/messages';
import mongoose from 'mongoose';
import { SocketsService } from 'src/socket/sockets.service';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Message.name) private MessageModel: Model<Message>,
        private sockets: SocketsService
    ) {
        this.MessageModel.watch([], { fullDocument: "updateLookup" }).on("change", async (data: mongoose.mongo.ChangeStreamDocument<Message>) => {
            let users: UUID[] = [];

            let eventName: string;
            let eventData: any;
            
            switch (data.operationType) {
                case "insert":
                    users.push(data.fullDocument.author, data.fullDocument.receiver);

                    eventName = data.fullDocument.type === "key" ? "conversationKey" : "newMessage";
                    eventData = data.fullDocument.toObject({ versionKey: false });
                    break;
                
                case "delete":
                    if (data.txnNumber) return;
                    users.push(data.fullDocumentBeforeChange.author, data.fullDocumentBeforeChange.receiver);

                    eventName = "deleteMessage";
                    eventData = { id: data.fullDocumentBeforeChange.id };
                    break;
                
                case 'update':
                    if (data.txnNumber) return;
                    users.push(data.fullDocumentBeforeChange.author, data.fullDocumentBeforeChange.receiver);
                    
                    if (data.fullDocumentBeforeChange.content !== data.fullDocument.content) {
                        eventName = "messageEdit";
                        eventData = data.fullDocument.toObject({ versionKey: false });
                    } else if (data.fullDocumentBeforeChange.read !== data.fullDocument.read) {
                        eventName = "readMessage";
                        eventData = { id: data.fullDocument.id };
                    }
                    break;

                default:
                    break;
            }

            for (const user of users) {
                this.sockets.sockets[user].emit(eventName, eventData);
            }
        })
    }

    async sendKey(key: string, author: UUID, receiver: UUID): Promise<Message> {
        const createdMessage = new this.MessageModel({
            type: "key",
            author: author,
            receiver: receiver,
            content: key,
            datetime: Date.now() * 1000,
        });

        return createdMessage.save();
    }

    async getKey(author: UUID, receiver: UUID): Promise<string | null> {
        const key = (await this.MessageModel.findOne({
            type: "key",
            author: author,
            receiver: receiver
        }));

        if (!key)
            return null;

        return key.content;
    }

    async deleteAllMessages(users: UUID[], deleteKeys: boolean = true): Promise<void> {
        await this.MessageModel.deleteMany({
            type: deleteKeys ? { $or: ["message", "key"] } : "message",
            $or: [
                { author: users[0], receiver: users[1] },
                { author: users[1], receiver: users[0] }
            ]
        });
    }

    async isConversationReady(users: UUID[]): Promise<Boolean> {
        let keysNumber = await this.MessageModel.countDocuments({
            type: "key",
            $or: [
                { author: users[0], receiver: users[1] },
                { author: users[1], receiver: users[0] }
            ]
        });

        return keysNumber >= 2;
    }

}