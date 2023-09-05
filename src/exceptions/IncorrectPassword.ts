import { HttpException } from "@nestjs/common";

export class IncorrectPassword extends HttpException {
    constructor() {
        super({
            opcode: "INCORRECT_PASSWORD"
        }, 400);
    }
}