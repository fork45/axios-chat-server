import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, UUID } from 'crypto';
import mongoose from 'mongoose';

import { User } from './schemas/user.schema';
import { generatePasswordHash } from "src/utils/users"
import { Token } from 'src/types/users';
import { InvalidToken } from 'src/exceptions/InvalidToken';
import { UserNotFound } from 'src/exceptions/UserNotFound';
import { IncorrectPassword } from 'src/exceptions/IncorrectPassword';

@Injectable()
export class UsersService {
    
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
    ) {}

    async getUserByUUID(uuid: string): Promise<User> {
        const user = await this.UserModel.findOne({ id: uuid });

        if (!user)
            throw new UserNotFound();

        return user;
    }

    async getUserByToken(token: Token): Promise<User> {
        let tokenHash = createHash("sha256").update(token).digest("hex");

        const user = await this.UserModel.findOne({ token: token });

        if (!user)
            throw new InvalidToken();

        return user;
    }

    async getUserByPassword(password: string): Promise<User> {
        const user = await this.UserModel.findOne({ password: generatePasswordHash(password) });
    
        if (!user)
            throw new IncorrectPassword();

        return user;
    }

    async getUserByName(name: string): Promise<User> {
        const user = await this.UserModel.findOne({ name: name });

        if (!user)
            throw new UserNotFound();

        return user;
    }
    
}