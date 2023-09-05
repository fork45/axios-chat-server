import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/database/schemas/user.schema";
import { IncorrectPassword } from "src/exceptions/IncorrectPassword";
import { generatePasswordHash, generateToken } from "src/utils/users";

@Injectable()
export class LoginService {
    
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
    ) {}

    async login(name: string, password: string) {
        const user = await this.UserModel.findOne({ name: name, password: generatePasswordHash(password) });

        if (!user)
            throw new IncorrectPassword();

        user.token = generateToken(user.id, password);
        return user;
    }

}