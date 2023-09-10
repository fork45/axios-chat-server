import { createHash } from "crypto";

import { Token } from "src/types/users";

export function generateToken(uuid: string, password: string): Token {
    const firstHash = createHash("sha256").update(`${uuid}:${password}`).digest("hex");
    const secondHash = createHash("sha256").update(`${password}:${uuid}`).digest("hex");
    const thirdHash = createHash("sha256").update(`${password + uuid}`).digest("hex");

    return `${firstHash}.${secondHash}.${thirdHash}`;
}

export function generatePasswordHash(password: string): string {
    return createHash("sha256").update(password).digest("hex");
}
