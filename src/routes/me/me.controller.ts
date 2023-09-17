import {
    Controller,
    Get,
    Headers,
    Param,
    Delete,
    Patch,
    Body,
    HttpCode
} from '@nestjs/common';

import { UsersService } from 'src/database/users.service';
import { Token, User } from 'src/types/users';
import { generatePasswordHash, generateToken } from 'src/utils/users';
import { MeService } from './me.service';
import { createHash } from 'crypto';

@Controller('@me')
export class MeController {

    constructor(
        private users: UsersService,
        private me: MeService
    ) {}

    @Get()
    async getAccount(
        @Headers("Authorization") token: Token
    ): Promise<User> {
        return (await this.users.getUserByToken(token)).toObject({ versionKey: false });
    };

    @Delete(":password")
    @HttpCode(204)
    async deleteAccount(
        @Headers("Authorization") token: Token,
        @Param("password") password: string
    ): Promise<void> {
        await this.me.deleteAccount(token, password);
    }

    @Patch("password")
    async changePassword(
        @Body("password") password: string,
        @Body("newPassword") newPassword: string
    ): Promise<{ token: Token }> {
        const user = await this.users.getUserByPassword(password)

        const passwordHash = generatePasswordHash(newPassword);
        const token = generateToken(user.id, newPassword);
        user.updateOne({
            password: passwordHash,
            token: createHash("sha256").update(generateToken(user.id, newPassword)).digest("hex")
        });

        return { token: token };
    }
    
}
