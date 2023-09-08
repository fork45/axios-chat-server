import { HttpException } from "@nestjs/common";

export class NameTaken extends HttpException {
    constructor() {
        super({
            opcode: "NAME_IS_TAKEN"
        }, 400);
    }
}