import { UUID } from "crypto";

export type MessageTypes = "message" | "rsa_key" | "aes_key";
export type MessageId = `${number}`;

export interface Message {
    type: MessageTypes;
    id: MessageId;
    author: UUID;
    receiver: UUID;
    content: string;
    iv: string | null;
    datetime: number;
    editDatetime?: number | null;
    read?: boolean;
}

export interface KeyMessage extends Message {
    type: "rsa_key" | "aes_key";
    iv: null;
    editDatetime: null;
    read: false;
}

export interface TextMessage extends Message {
    type: "message";
    editDatetime: number;
    read: boolean;
}