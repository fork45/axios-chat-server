import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketsService } from './socket/sockets.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.httpServerPort);
    const socket = app.get(SocketsService);
}

bootstrap();