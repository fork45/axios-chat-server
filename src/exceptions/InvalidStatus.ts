import { HttpException } from "@nestjs/common";

export class InvalidStatus extends HttpException {
    constructor() {
        super({
            opcode: "INVALID_STATUS"
        }, 400);
    }
}