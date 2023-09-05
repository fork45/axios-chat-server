import { HttpException } from "@nestjs/common";

export class InvalidAvatarSize extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_AVATAR_SIZE"
        }, 400);
    }
}