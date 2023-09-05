import { HttpException } from "@nestjs/common";

export class InvalidMessageId extends HttpException {
    constructor(index: number) {
        super({
            opcode: "INVALID_MESSAGE_ID_" + index
        }, 400);
    }
}