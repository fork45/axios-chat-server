import {
    Controller,
    Get,
    Post,
    Param,
    Headers,
    UploadedFile,
    UseInterceptors,
    HttpCode,
    Response as Res
} from '@nestjs/common';
import { Response } from "express"
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from 'src/database/users.service';
import { StorageService } from 'src/storage/storage.service';
import { Token } from 'src/types/users';
import { InvalidAvatarFormat } from 'src/exceptions/InvalidAvatarFormat';
import { InvalidAvatarSize } from 'src/exceptions/InvalidAvatarSize';
import { AvatarNotFound } from 'src/exceptions/AvatarNotFound';

@Controller('avatars')
export class AvatarsController {
    constructor(
        private users: UsersService,
        private storage: StorageService
    ) {}

    @Post()
    @HttpCode(204)
    @UseInterceptors(FileInterceptor('file', {limits: {
        fileSize: 10000000
    }}))
    async setAvatar(
        @Headers("Authorization") token: Token,
        @UploadedFile() file: Express.Multer.File
    ): Promise<void> {
        if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg")
            throw new InvalidAvatarFormat();
        else if (file.size === 0)
            throw new InvalidAvatarSize();
        

        let user = await this.users.getUserByToken(token);
        
        if (user.avatar)
            await this.storage.deleteAvatar(user.avatar);
        
        user.avatar = await this.storage.uploadAvatar(file);
        await user.save();
    }

    @Get(":hash")
    async getAvatar(
        @Res() response: Response,
        @Param("hash") hash: string
    ): Promise<Response> {
        try {
            var avatar = await this.storage.getAvatar(hash);
        } catch (error) {
            throw new AvatarNotFound();
        }

        return response.set("Content-Type", avatar.ContentType).send(avatar.Body);
    }
}