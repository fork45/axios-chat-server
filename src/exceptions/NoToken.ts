import { HttpException } from "@nestjs/common";

export class NoToken extends HttpException {
    constructor() {
        super({
            opcode: "NO_TOKEN"
        }, 401);
    }
}