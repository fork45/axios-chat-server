import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UUID } from "crypto";

import { User } from "src/database/schemas/user.schema";
import { Profile } from "src/types/users";
import { SocketsService } from "src/socket/sockets.service";

@Injectable()
export class ProfileService {

    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private sockets: SocketsService
    ) {}

    async getProfile(id: UUID): Promise<Profile> {
        const user = await this.UserModel.findOne({ id: id });
        const data: Profile = user.publicData as Profile;
        data.rsaKey = user.publicKey;
        const userStatus = this.sockets.sockets[id]?.data.status;
        data.status = userStatus === "hidden" ? "offline" : userStatus;

        return data;
    }

}