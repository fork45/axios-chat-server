import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UUID } from "crypto";
import { Document } from "mongoose";

import { PublicUser, Token } from "src/types/users";
import { isValidPublicRsaKey } from "src/utils/keys";

@Schema({ collection: "users", validateBeforeSave: true })
export class User extends Document {
    @Prop({ required: true, unique: true, immutable: true })
    id: UUID;
    
    @Prop({ required: true, unique: true, maxlength: 255, minlength: 4, match: /^[a-zA-Z0-9]+$/ })
    name: string;

    @Prop({ required: true, maxlength: 255, minlength: 4, match: /^[a-zA-Z0-9]+$/ })
    nickname: string;
    
    @Prop({ required: true })
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

    @Prop({ required: true, validate: { validator: isValidPublicRsaKey }})
    publicKey: string;

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