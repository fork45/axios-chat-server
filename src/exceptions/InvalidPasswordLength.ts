import { HttpException } from "@nestjs/common";

export class InvalidPasswordLength extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_PASSWORD_LENGTH"
        }, 400);
    }
}