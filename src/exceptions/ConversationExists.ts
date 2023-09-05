import { HttpException } from "@nestjs/common";

export class ConversationExists extends HttpException {
    constructor() {
        super({
            opcode: "CONVERSATION_EXISTS"
        }, 400);
    }
}