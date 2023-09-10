import { HttpException } from "@nestjs/common";

export class NoPermissionToDelete extends HttpException {
    constructor() {
        super({
            opcode: "NO_PERMISSION_TO_DELETE"
        }, 403);
    }
}