import { HttpException } from "@nestjs/common";

export class InvalidLimit extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_LIMIT"
        }, 400);
    }
}