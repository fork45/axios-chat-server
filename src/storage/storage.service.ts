import { Injectable, Req, Res } from '@nestjs/common';
import crypto from "crypto";
import * as AWS from 'aws-sdk';
import { AvatarNotFound } from 'src/exceptions/AvatarNotFound';

@Injectable()
export class StorageService {
    AWS_S3_BUCKET = process.env.avatarsBucket;
    s3 = new AWS.S3({
        accessKeyId: process.env.AWSAccessKeyId,
        secretAccessKey: process.env.AWSSecretAccessKey,
    });

    async uploadAvatar(file: Express.Multer.File) {
        const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");

        await this.s3.upload({
            Bucket: this.AWS_S3_BUCKET,
            Key: hash,
            Body: file.buffer,
        }).promise();

        return hash;
    }

    async getAvatar(hash: string) {
        try {
            return this.s3.getObject({
                Bucket: this.AWS_S3_BUCKET,
                Key: hash,
            }).promise();
        } catch (error) {
            throw new AvatarNotFound();
        }

    }

    async deleteAvatar(hash: string) {
        await this.s3.deleteObject({
            Bucket: this.AWS_S3_BUCKET,
            Key: hash,
        }).promise();
    }
}