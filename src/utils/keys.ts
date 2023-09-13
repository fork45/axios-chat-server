import crypto from "crypto";

export function isValidPublicRsaKey(key: string): boolean {
    try {
        crypto.publicEncrypt(key, Buffer.from(`qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567899100$@!#(),./;:[]{}|\<>?^&*_-=+"'`));
    } catch (error) {
        return false
    }

    return true
}