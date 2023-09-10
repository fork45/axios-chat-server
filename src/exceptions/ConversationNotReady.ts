import { HttpException } from "@nestjs/common";

export class ConversationNotReady extends HttpException {
    constructor() {
        super({
            opcode: "CONVERSATION_NOT_READY"
        }, 403);
    }
}