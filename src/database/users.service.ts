import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, UUID } from 'crypto';
import mongoose from 'mongoose';

import { User } from './schemas/user.schema';
import { generatePasswordHash } from "src/utils/users"
import { Token } from 'src/types/users';
import { SocketsService } from 'src/socket/sockets.service';
import { InvalidToken } from 'src/exceptions/InvalidToken';
import { UserNotFound } from 'src/exceptions/UserNotFound';
import { IncorrectPassword } from 'src/exceptions/IncorrectPassword';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private sockets: SocketsService
    ) {
        this.UserModel.watch([], { fullDocument: "updateLookup" }).on("change", async (data: mongoose.mongo.ChangeStreamDocument<User>) => {
            let user: UUID;

            let eventName: string;
            let eventData: any;
            
            switch (data.operationType) {
                case "update":
                    user = data.fullDocumentBeforeChange.id;
                    if (data.fullDocumentBeforeChange.nickname !== data.fullDocument.nickname) {
                        eventName = "changeNickname";
                        eventData = { user: data.fullDocumentBeforeChange.id, nickname: data.fullDocument.nickname };
                    } else if (data.fullDocumentBeforeChange.avatar !== data.fullDocument.avatar) {
                        eventName = "avatarChange";
                        eventData = { user: data.fullDocumentBeforeChange.id, hash: data.fullDocument.avatar };
                    } else if (data.fullDocumentBeforeChange.status !== data.fullDocument.status) {
                        eventName = "changeStatus";
                        eventData = { user: data.fullDocumentBeforeChange.id, status: data.fullDocument.status === "hidden" ? "offline" : data.fullDocument.status };
                    } else if (data.fullDocumentBeforeChange.lastExitTime !== data.fullDocument.lastExitTime) {
                        eventName = "changeStatus";
                        eventData = { user: data.fullDocumentBeforeChange.id, status: "offline" };
                    } else if (data.fullDocumentBeforeChange.conversationsWith !== data.fullDocument.conversationsWith) {
                        for (const user of data.fullDocumentBeforeChange.conversationsWith) {
                            if (data.fullDocument.conversationsWith.includes(user))
                                return this.sockets.sockets[user]?.emit("conversationDelete", { user: user });
                        }
                    }
                    break;
                case "delete":
                    user = data.fullDocumentBeforeChange.id

                    eventName = "userDelete";
                    eventData = { id: data.fullDocumentBeforeChange.id };
                    break;

                default:
                    break;
            }

            this.sockets.server.in(user).emit(eventName, eventData)
        });
    }

    async getUserByUUID(uuid: string): Promise<User> {
        const user = await this.UserModel.findOne({ id: uuid });

        if (!user)
            throw new UserNotFound();

        return user;
    }

    async getUserByToken(token: Token): Promise<User> {
        let tokenHash = createHash("sha256").update(token).digest("hex");

        const user = await this.UserModel.findOne({ token: token });

        if (!user)
            throw new InvalidToken();

        return user;
    }

    async getUserByPassword(password: string): Promise<User> {
        const user = await this.UserModel.findOne({ password: generatePasswordHash(password) });
    
        if (!user)
            throw new IncorrectPassword();

        return user;
    }

    async getUserByName(name: string): Promise<User> {
        const user = await this.UserModel.findOne({ name: name });

        if (!user)
            throw new UserNotFound();

        return user;
    }
}