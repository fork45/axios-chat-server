import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UUID, randomUUID } from "crypto";
import { Document, VirtualType } from "mongoose";
import { PublicUser, Token } from "src/types/users";

@Schema({ collection: "users" })
export class User extends Document {
    @Prop({ required: true, unique: true, immutable: true })
    id: UUID;
    
    @Prop({ required: true, unique: true, maxlength: 255, minlength: 4, match: /^[a-zA-Z0-9]+$/ })
    name: string;

    @Prop({ required: true, maxlength: 255, minlength: 4, match: /^[a-zA-Z0-9]+$/ })
    nickname: string;
    
    @Prop({ required: true, maxlength: 30, minlength: 8 })
    password: string;
    
    @Prop({ unique: true })
    token: Token;
    
    @Prop({ default: "offline" })
    status: string;
    
    @Prop({ default: [] })
    conversationsWith: UUID[];
    
    @Prop({ default: null })
    lastExitTime: number | null;
    
    @Prop({ default: null })
    avatar: string | null;

    publicData: PublicUser;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual("publicData").get(function() {
    delete this._id;
    delete this.lastExitTime;
    delete this.conversationsWith;
    delete this.status;
    delete this.password;
    delete this.token;

    return this;
});