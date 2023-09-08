import { randomUUID } from "crypto";

export type MessageTypes = "message" | "key";
export type MessageId = `${number}`;

export interface Message {
    type: MessageTypes;
    id: MessageId;
    author: string;
    receiver: string;
    content: string;
    datetime: number;
    editDatetime?: number | null;
    read?: boolean;
}