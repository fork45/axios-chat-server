import { HttpException } from "@nestjs/common";

export class InvalidKey extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_SECURITY_KEY"
        }, 400);
    }
}