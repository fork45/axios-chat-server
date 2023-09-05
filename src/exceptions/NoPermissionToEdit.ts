import { HttpException } from "@nestjs/common";

export class NoPermissionToEdit extends HttpException {
    constructor() {
        super({
            opcode: "NO_PERMISSION_TO_EDIT"
        }, 401);
    }
}