import { HttpException } from "@nestjs/common";

export class MessageNotFound extends HttpException {
    constructor() {
        super({
            opcode: "MESSAGE_NOT_FOUND"
        }, 404);
    }
}