import {
    Controller,
    Post,
    HttpCode,
    Body,
    UseFilters
} from '@nestjs/common';

import { User, CreateAccountDTO } from 'src/types/users';
import { AccountService } from './account.service';
import { InvalidPasswordLength } from 'src/exceptions/InvalidPasswordLength';
import { MongoErrorFilter } from './account.filters';

@Controller('account')
@UseFilters(MongoErrorFilter)
export class AccountController {
    
    constructor(private accounts: AccountService) {}

    @Post()
    @HttpCode(200)
    async createAccount(@Body() newUser: CreateAccountDTO): Promise<User> {
        if (newUser.password.length < 8 || newUser.password.length > 30)
            throw new InvalidPasswordLength();
        
        let user = await this.accounts.createAccount(newUser);

        return user.toObject({ versionKey: false });
    }

}
