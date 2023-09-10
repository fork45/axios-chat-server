import { HttpException } from "@nestjs/common";
import { MessageId } from "src/types/messages";

export class MessageNotFound extends HttpException {
    constructor(message: MessageId = undefined) {
        super({
            opcode: "MESSAGE_NOT_FOUND",
            message: message
        }, 404);
    }
}