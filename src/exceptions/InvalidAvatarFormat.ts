import { HttpException } from "@nestjs/common";

export class InvalidAvatarFormat extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_AVATAR_FORMAT"
        }, 400);
    }
}