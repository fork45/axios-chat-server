import { Controller, Get, Param } from '@nestjs/common';

import { LoginService } from './login.service';
import { User } from 'src/types/users';

@Controller('login')
export class LoginController {
    
    constructor(
        private loginService: LoginService
    ) {}

    @Get(":name/:password")
    async login(
        @Param("name") name: string,
        @Param("password") password: string
    ): Promise<User> {
        return (await this.loginService.login(name, password));
    }

}
