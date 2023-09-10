import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { SocketData, Sockets, statuses } from 'src/types/socket';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { UsersService } from 'src/database/users.service';

@Injectable()
export class SocketsService {
    private socketServer: Server;
    public sockets: Sockets;

    constructor(
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
    }

    get server(): Server {
        return this.socketServer;
    }
}