import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import mongoose, { Error } from 'mongoose';
import { NameDoesntMatch } from 'src/exceptions/NameDoesntMatch';
import { NameTaken } from 'src/exceptions/NameTaken';
import { NicknameDoesntMatch } from 'src/exceptions/NicknameDoesntMatch';
import { MongoServerError } from "mongodb";

@Catch(Error.ValidatorError)
export class MongoErrorFilter implements ExceptionFilter {
    catch(exception: Error.ValidatorError, host: ArgumentsHost) {
        if (exception.kind === "match" && exception.path === "name")
            throw new NameDoesntMatch();
        else if (exception.kind === "match" && exception.path === "nickname")
            throw new NicknameDoesntMatch();
        
        switch (exception.path) {
            case "name":
                throw new NameTaken();
            
            default:
                host.switchToHttp().getResponse().status(500).send()
                break;
        }
    }
}

@Catch(mongoose.mongo.MongoServerError)
export class MongoServerErrorFilter implements ExceptionFilter {
    catch(exception: mongoose.mongo.MongoServerError, host: ArgumentsHost) {
        if (exception.code === 11000)
            throw new NameTaken();
        
    }
}
