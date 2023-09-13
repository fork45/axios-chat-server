import { UUID } from "crypto";

export type Token = `${string}.${string}.${string}`;

export interface CreateAccountDTO {
    name: string,
    nickname: string,
    password: string,
    publicKey: string,
};

export interface PublicUser {
    id: UUID;
    name: string;
    nickname: string,
    avatar: null | string,
}

export interface Profile extends PublicUser {
    status: "online" | "do not disturb" | "offline";
    rsaKey: string;
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