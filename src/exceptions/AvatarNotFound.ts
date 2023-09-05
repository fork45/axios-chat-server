import { HttpException } from "@nestjs/common";

export class AvatarNotFound extends HttpException {
    constructor() {
        super({
            opcode: "AVATAR_NOT_FOUND"
        }, 404);
    }
}