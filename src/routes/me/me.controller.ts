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
import { generatePasswordHash } from 'src/utils/users';
import { MeService } from './me.service';

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

    @Patch("nickname")
    @HttpCode(204)
    async changeNickname(
        @Body("nickname") nickname: string,
        @Headers("Authorization") token: Token
    ): Promise<void> {
        (await this.users.getUserByToken(token)).updateOne({ nickname: nickname });
    }

    @Patch("password")
    @HttpCode(204)
    async changePassword(
        @Body("password") password: string,
        @Body("newPassword") newPassword: string
    ): Promise<void> {
        (await this.users.getUserByPassword(password)).updateOne({ password: generatePasswordHash(newPassword) });
    }
    
}
