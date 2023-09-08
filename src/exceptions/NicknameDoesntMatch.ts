import { HttpException } from "@nestjs/common";

export class NicknameDoesntMatch extends HttpException {
    constructor() {
        super({
            opcode: "NICKNAME_DOESNT_MATCH_REGEX"
        }, 404);
    }
}