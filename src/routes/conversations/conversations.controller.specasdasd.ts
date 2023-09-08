/*
import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { UsersService } from 'src/database/users.service';
import { MessagesService } from 'src/database/messages.service';
import { createHash, createPrivateKey, generateKeyPairSync, randomUUID } from 'crypto';
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection, connect, Model } from "mongoose";
import { NameTaken } from 'src/exceptions/NameTaken';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { generateToken } from 'src/utils/users';
import { Message, MessageSchema } from 'src/database/schemas/message.schema';
import { Token } from 'src/types/users';
import { UserNotFound } from 'src/exceptions/UserNotFound';

describe('ConversationController', () => {
    let controller: ConversationsController;
    let mongoserver: MongoMemoryServer;
    let mongoConnection: Connection;
    let userModel: Model<User>;
    let messageModel: Model<Message>;
    let firstUser: User;
    let secondUser: User;
    let firstUserToken: Token;
    let secondUserToken: Token;

    beforeAll(async () => {
        mongoserver = await MongoMemoryServer.create();
        const uri = mongoserver.getUri();
        mongoConnection = (await connect(uri)).connection;
    });

    beforeEach(async () => {
        userModel = mongoConnection.model(User.name, UserSchema);
        messageModel = mongoConnection.model(Message.name, MessageSchema);
        
        let id = randomUUID();
        let password = createHash("sha256").update("testpassword18").digest('hex');
        firstUserToken = generateToken(id, password);
        
        firstUser = await new userModel({
            id: id,
            name: "fr45",
            nickname: "fr45",
            password: password,
            token: createHash("sha256").update(firstUserToken).digest("hex")
        }).save();

        id = randomUUID();
        secondUserToken = generateToken(id, password);
        secondUser = await new userModel({
            id: id,
            name: "fr455",
            nickname: "fr455",
            password: password,
            token: createHash("sha256").update(secondUserToken).digest("hex")
        }).save();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
                MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])
            ],
            controllers: [ConversationsController],
            providers: [
                ConversationsService,
                UsersService,
                MessagesService,
                { provide: getModelToken(User.name), useValue: userModel },
                { provide: getModelToken(Message.name), useValue: messageModel },
            ]
        }).compile();

        controller = module.get<ConversationsController>(ConversationsController);
    });

    afterEach(async () => {
        const collections = mongoConnection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    });

    afterAll(async () => {
        await mongoConnection.dropDatabase();
        await mongoConnection.close(true);
        await mongoserver.stop();
    });

    it('should create conversation', async () => {
        let keyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
        await controller.createConversation(firstUserToken, secondUser.name, keyPair.publicKey.export().toString("base64"));
    });

    it("should return UserNotFound error", async () => {
        let keyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
        try {
            await controller.createConversation(firstUserToken, secondUser.name, keyPair.publicKey.export().toString("base64"));
        } catch (error) {
            expect(error).toBeInstanceOf(UserNotFound);
        }
    });

    /*
    it("should return NameTaken error", async () => {
        const name = "fr45";
        const password = "testpassword18";

        await controller.createAccount({
            name: name,
            nickname: name,
            password: password
        });

        try {
            const account = await controller.createAccount({
                name: name,
                nickname: name,
                password: password
            });
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.mongo.MongoServerError)
            expect(error).toBeInstanceOf(NameTaken);
        }
        
    });
    
});
*/