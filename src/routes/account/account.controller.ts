import { Controller, Post, HttpCode, Body } from '@nestjs/common';
import { User, CreateAccountBody} from 'src/types/users';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
    
    constructor(private accounts: AccountService) {}

    @Post()
    @HttpCode(200)
    async createAccount(@Body() newUser: CreateAccountBody): Promise<User> {
        let user = await this.accounts.createAccount(
            newUser.name, 
            newUser.nickname, 
            newUser.password
        );
        
        return user.toObject({ versionKey: false });
    };
}
