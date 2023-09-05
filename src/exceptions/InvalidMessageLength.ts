import { HttpException } from "@nestjs/common";

export class InvalidMessageLength extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_MESSAGE_LENGTH",
        }, 400);
    }
}