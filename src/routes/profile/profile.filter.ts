import {
    Catch,
    ExceptionFilter,
    ArgumentsHost
} from '@nestjs/common';
import { Error } from 'mongoose';

import { NicknameDoesntMatch } from 'src/exceptions/NicknameDoesntMatch';

@Catch(Error.ValidatorError)
export class ProfileFilter implements ExceptionFilter {
    catch(exception: Error.ValidatorError, host: ArgumentsHost) {
        if (exception.kind === "match", exception.path === "nickname")
            throw new NicknameDoesntMatch();
    }
}