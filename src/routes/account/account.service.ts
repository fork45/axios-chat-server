import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createHash, randomUUID } from "crypto";
import { Model } from "mongoose";

import { User } from "src/database/schemas/user.schema";
import { CreateAccountDTO } from "src/types/users";
import { generatePasswordHash, generateToken } from "src/utils/users";

@Injectable()
export class AccountService {

    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
    ) {}

    async createAccount(account: CreateAccountDTO): Promise<User> {
        const uuid = randomUUID();
        const passwordHash = generatePasswordHash(account.password);
        const token = createHash("sha256").update(generateToken(uuid, account.password)).digest("hex");

        const createdUser = new this.UserModel({
            id: uuid,
            name: account.name,
            nickname: account.nickname,
            password: passwordHash,
            token: token,
            publicKey: account.publicKey
        });

        return createdUser.save();
    }

}