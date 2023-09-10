import { UUID } from "crypto";

export type MessageTypes = "message" | "key";
export type MessageId = `${number}`;

export interface Message {
    type: MessageTypes;
    id: MessageId;
    author: UUID;
    receiver: UUID;
    content: string;
    datetime: number;
    editDatetime?: number | null;
    read?: boolean;
}

export interface KeyMessage extends Message {
    type: "key";
    editDatetime: null;
    read: false;
}

export interface TextMessage extends Message {
    type: "message";
    editDatetime: number;
    read: boolean;
}