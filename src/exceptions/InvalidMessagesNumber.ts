import { HttpException } from "@nestjs/common";

export class InvalidMessageNumber extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_MESSAGES_NUMBER"
        }, 400);
    }
}