import { UUID } from "crypto";
import { statuses } from "./socket";

export type Token = `${string}.${string}.${string}`;

export interface CreateAccountBody {
    name: string,
    nickname: string,
    password: string
};

export interface PublicUser {
    id: UUID;
    name: string;
    nickname: string,
    avatar: null | string,
}

export interface ConversationUser extends PublicUser {
    status: "online" | "offline" | "do not disturb";
    key: string;
}

export interface User {
    id: UUID,
    name: string,
    nickname: string,
    password?: string,
    token?: string,
    status?: "offline",
    conversationsWith?: UUID[],
    lastExitTime?: number,
    avatar: null | string,
}