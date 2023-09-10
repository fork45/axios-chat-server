import { UUID } from "crypto";

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
    status: "online" | "do not disturb" | "offline";
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