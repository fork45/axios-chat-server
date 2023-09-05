import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UUID } from "crypto";
import { Document } from "mongoose";
import { MessageId, MessageTypes } from "src/types/messages";
import { generateMessageId } from "src/utils/messages";

@Schema({ collection: "messages" })
export class Message extends Document {
    @Prop({ required: true, immutable: true })
    type: MessageTypes;

    @Prop({ required: true, immutable: true, default: generateMessageId })
    id: MessageId;

    @Prop({ required: true, immutable: true })
    author: UUID;

    @Prop({ required: true, immutable: true })
    receiver: UUID;

    @Prop({ required: true, maxlength: 1200, minlength: 1 })
    content: string;

    @Prop({ required: true, immutable: true })
    datetime: number;

    @Prop({ required: false, default: null })
    editDatetime: null | number;
    
    @Prop({ required: false, default: false })
    read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);