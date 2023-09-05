import { HttpException } from "@nestjs/common";

export class InvalidAccountParameters extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_ACCOUNT_PARAMETERS"
        }, 400);
    }
}