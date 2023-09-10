import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createHash } from "crypto";
import { Model } from "mongoose";

import { MessagesService } from "src/database/messages.service";
import { User } from "src/database/schemas/user.schema";
import { InvalidToken } from "src/exceptions/InvalidToken";
import { Token } from "src/types/users";
import { generatePasswordHash } from "src/utils/users";

@Injectable()
export class MeService {

    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private messages: MessagesService
    ) {}

    async deleteAccount(token: Token, password: string): Promise<void> {        
        const hash = createHash("sha256").update(token).digest("hex");
        const user = await this.UserModel.findOne({ token: hash });

        if (!user)
            throw new InvalidToken();

        await this.UserModel.deleteOne({ token: hash, password: generatePasswordHash(password) });
        
        for await (const id of user.conversationsWith) {
            await this.messages.deleteAllMessages([id, user.id]);
        }
    }

}