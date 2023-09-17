import { HttpException } from "@nestjs/common";

export class NoSelfConversations extends HttpException {
    constructor() {
        super({
            opcode: "NO_SELF_CONVERSATIONS"
        }, 403);
    }
}