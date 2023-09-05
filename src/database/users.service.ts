import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { randomUUID, createHash, UUID } from 'crypto';
import { generatePasswordHash, generateToken } from "src/utils/users"
import { Token } from 'src/types/users';
import mongoose from 'mongoose';
import { SocketsService } from 'src/socket/sockets.service';

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

    async getUserByUUID(uuid: string) {
        return await this.UserModel.findOne({ id: uuid });
    }

    async getUserByToken(token: Token) {
        let tokenHash = createHash("sha256").update(token).digest("hex");

        return await this.UserModel.findOne({ token: token });
    }

    async getUserByPassword(password: string) {
        return await this.UserModel.findOne({ password: generatePasswordHash(password) });
    }

    async getUserByName(name: string) {
        return await this.UserModel.findOne({ name: name });
    }
}