import { HttpException } from "@nestjs/common";

export class NoConversation extends HttpException {
    constructor() {
        super({
            opcode: "NO_CONVERSATION"
        }, 404);
    }
}