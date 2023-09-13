import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UUID } from "crypto";
import { Model } from "mongoose";

import { User } from "src/database/schemas/user.schema";
import { Profile } from "src/types/users";
import { ProfileService } from "../profile/profile.service";

@Injectable()
export class ConversationsService {

    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private profiles: ProfileService
    ) {}

    async createConversation(users: UUID[]): Promise<void> {
        await this.UserModel.updateOne({ id: users[0] }, { $push: { conversationsWith: users[1] } });
        await this.UserModel.updateOne({ id: users[1] }, { $push: { conversationsWith: users[0] } });
    }

    async getConversations(user: UUID): Promise<Profile[]> {
        const conversations = (await this.UserModel.findOne({ id: user })).conversationsWith
        return await Promise.all(conversations.map(async id =>
            await this.profiles.getProfile(id)
        ));
    }

    async deleteConversation(users: UUID[]): Promise<void> {
        await this.UserModel.updateOne({ id: users[0] }, { $pull: { conversationsWith: users[1] } });
        await this.UserModel.updateOne({ id: users[1] }, { $pull: { conversationsWith: users[0] } });
    }

}