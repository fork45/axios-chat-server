import { UUID } from "crypto";
import { Socket } from "socket.io";

import { Token } from "./users";

export type statuses = "online" | "do not disturb" | "hidden";

export interface Sockets {
    [id: UUID]: Socket;
}

export interface SocketData {
    id: UUID;
    token: Token;
    status: statuses
}