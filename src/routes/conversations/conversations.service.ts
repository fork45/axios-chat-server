import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UUID } from "crypto";
import { Model } from "mongoose";
import { MessagesService } from "src/database/messages.service";
import { User } from "src/database/schemas/user.schema";
import { ConversationExists } from "src/exceptions/ConversationExists";
import { NoConversation } from "src/exceptions/NoConversation";
import { SocketsService } from "src/socket/sockets.service";
import { ConversationUser, PublicUser } from "src/types/users";

@Injectable()
export class ConversationsService {

    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private messages: MessagesService,
        private sockets: SocketsService
    ) {}

    async createConversation(users: UUID[]) {
        if (!(await this.UserModel.findOne({ id: users[0] })).conversationsWith.includes(users[1])) {
            throw new ConversationExists();
        }

        await this.UserModel.updateOne({ id: users[0] }, { $push: { conversationsWith: users[1] } });
        await this.UserModel.updateOne({ id: users[1] }, { $push: { conversationsWith: users[0] } });
    }

    async getConversation(requester: UUID, id: UUID) {
        const user = await this.UserModel.findOne({ id: id });
        const data: ConversationUser = user.publicData as ConversationUser;
        data.key = await this.messages.getKey(requester, id);
        const userStatus = this.sockets.sockets[id].data.status;
        data.status = userStatus === "hidden" ? "offline" : userStatus;

        return data;
    }

    async getConversations(user: UUID) {
        return (await this.UserModel.findOne({ id: user })).conversationsWith.map(async id => {
            return await this.getConversation(user, id);
        });
    }

    async deleteConversation(users: UUID[]) {
        if ((await this.UserModel.findOne({ id: users[0] })).conversationsWith.includes(users[1])) {
            throw new NoConversation();
        }

        await this.UserModel.updateOne({ id: users[0] }, { $pull: { conversationsWith: users[1] } });
        await this.UserModel.updateOne({ id: users[1] }, { $pull: { conversationsWith: users[0] } });
    }

}