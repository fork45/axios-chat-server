import { Injectable, NestMiddleware } from '@nestjs/common';
import { createHash } from 'crypto';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
    use(req: Request, res: Response) {
        const token = req.headers.authorization;

        if (!token)
            return res.status(401).send({ opcode: "NO_TOKEN" });
        

        let user = mongoose.connection.collection("users").findOne({
            token: createHash("sha256").update(token).digest("hex")
        });

        if (!user)
            return res.status(401).send({ opcode: "INVALID_TOKEN" });
        
    }
}
