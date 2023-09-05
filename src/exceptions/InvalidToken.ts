import { HttpException } from "@nestjs/common";

export class InvalidToken extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_TOKEN",
        }, 401);
    }
}