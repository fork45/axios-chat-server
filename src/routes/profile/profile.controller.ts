import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Patch,
    Headers,
    UseFilters
} from '@nestjs/common';

import { ProfileService } from './profile.service';
import { UUID } from 'crypto';
import { Profile, Token } from 'src/types/users';
import { UsersService } from 'src/database/users.service';
import { ProfileFilter } from './profile.filter';

@Controller('profile')
@UseFilters(ProfileFilter)
export class ProfileController {

    constructor(
        private profiles: ProfileService,
        private users: UsersService
    ) {}

    @Get(":user")
    async getProfile(
        @Param(":user") user: UUID
    ): Promise<Profile> {
        return await this.profiles.getProfile(user);
    }

    @Patch("nickname")
    @HttpCode(204)
    async changeNickname(
        @Body("nickname") nickname: string,
        @Headers("Authorization") token: Token
    ): Promise<void> {
        (await this.users.getUserByToken(token)).updateOne({
            $set: { nickname: nickname }
        });
    }

}