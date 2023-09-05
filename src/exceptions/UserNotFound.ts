import { HttpException } from "@nestjs/common";

export class UserNotFound extends HttpException {
    constructor() {
        super({
            opcode: "USER_NOT_FOUND",
        }, 404);
    }
}