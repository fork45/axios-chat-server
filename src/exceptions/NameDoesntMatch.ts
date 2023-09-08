import { HttpException } from "@nestjs/common";

export class NameDoesntMatch extends HttpException {
    constructor() {
        super({
            opcode: "NAME_DOESNT_MATCH_REGEX"
        }, 404);
    }
}