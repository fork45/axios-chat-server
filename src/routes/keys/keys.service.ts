import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UUID, publicEncrypt } from "crypto";
import { Model } from "mongoose";

import { Message } from "src/database/schemas/message.schema";

@Injectable()
export class KeysService {

    constructor(
        @InjectModel(Message.name) private MessageModel: Model<Message>,
    ) {}

    async encryptAESKey(receiver: UUID, publicKey: string): Promise<void> {
        let key = (await this.MessageModel.findOne({ type: "aes_key", receiver: receiver })).content;
        
        await this.MessageModel.updateOne({
            type: "aes_key",
            receiver: receiver,
        }, {
            $set: {
                "content": publicEncrypt(publicKey, Buffer.from(key)).toString("hex")
            }
        });
    }

}