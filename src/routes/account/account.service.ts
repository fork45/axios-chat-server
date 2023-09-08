import { Injectable, UseFilters } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createHash, randomUUID } from "crypto";
import { Model } from "mongoose";
import { User } from "src/database/schemas/user.schema";
import { generatePasswordHash, generateToken } from "src/utils/users";
import { MongoErrorFilter } from "./account.filters";

@Injectable()
export class AccountService {

    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
    ) {}

    async createAccount(name: string, nickname: string, password: string): Promise<User> {
        const uuid = randomUUID();
        const passwordHash = generatePasswordHash(password);
        const token = createHash("sha256").update(generateToken(uuid, password)).digest("hex");

        const createdUser = new this.UserModel({
            id: uuid,
            name: name,
            nickname: nickname,
            password: passwordHash,
            token: token,
        });

        return createdUser.save();
    }

}