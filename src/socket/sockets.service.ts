import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from "src/database/schemas/message.schema";
import { User } from "src/database/schemas/user.schema";

import { SocketData, Sockets, statuses } from 'src/types/socket';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { UsersService } from 'src/database/users.service';

@Injectable()
export class SocketsService {
    
    private socketServer: Server;
    public sockets: Sockets;

    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Message.name) private MessageModel: Model<Message>,
        private users: UsersService
    ) {
        this.socketServer = new Server();

        this.sockets = {};

        this.server.on("connection", async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => {
            socket.data.token = socket.handshake.auth.token;

            let user = await this.users.getUserByToken(socket.data.token);
        
            socket.data.id = user.id;
            socket.data.status = "online"
            this.sockets[user.id] = socket;

            if (user.status !== "hidden")
                socket.in(user.id).emit("status", {
                    user: user.id,
                    status: user.status
                });

            socket.join(user.conversationsWith);

            socket.emit("ready");
            
            socket.on("disconnect", async () => {
                delete this.sockets[socket.data.id];
                user.lastExitTime = new Date().getTime() / 1000;
                await user.save();
            });

            socket.on("typing", async (data: { user: UUID }) => {
                if (!socket.rooms.has(data.user))
                    return socket.emit("error", { opcode: "NO_CONVERSATION", user: user })

                this.sockets[data.user].emit("userTyping", { user: user.id })
            });

            socket.on("changeStatus", async (data: { status: statuses }) => {
                if (!(data.status satisfies statuses))
                    return socket.emit("error", { opcode: "INVALID_STATUS", status: status });
                else if (socket.data.status === data.status)
                    return;
                
                socket.data.status = data.status;

                user.status = data.status;
                await user.save();
            });
        });

        // Events
        this.MessageModel.watch([], { fullDocument: "updateLookup" }).on("change", async (data: mongoose.mongo.ChangeStreamDocument<Message>) => {
            let users: UUID[] = [];

            let eventName: string;
            let eventData: any;

            switch (data.operationType) {
                case "insert":
                    users.push(data.fullDocument.author, data.fullDocument.receiver);

                    eventData = data.fullDocument.publicData;
                    if (data.fullDocument.type === "message")
                        eventName = "newMessage";
                    else if (data.fullDocument.type === "rsa_key")
                        eventName = "rsaKey"
                    else {
                        eventName = "newConversation"
                        eventData = { user: data.fullDocument.author, key: data.fullDocument }
                    }
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

                    if (data.fullDocumentBeforeChange.content === data.fullDocument.content) break;

                    eventName = data.fullDocument.type === "message" ? "messageEdit" : "aesKeyEdit";
                    eventData = data.fullDocument.publicData;

                    break;

                default:
                    break;
            }

            for (const user of users) {
                this.sockets[user]?.emit(eventName, eventData);
            }
        });

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
                            if (data.fullDocumentBeforeChange.conversationsWith.includes(user) && !data.fullDocument.conversationsWith.includes(user))
                                return this.sockets[user]?.emit("conversationDelete", { user: user });
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

            this.socketServer.in(user).emit(eventName, eventData)
        });
    }

    get server(): Server {
        return this.socketServer;
    }

}