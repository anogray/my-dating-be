import { Module } from "@nestjs/common";
// import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";

@Module({
    imports: [
        // ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            // imports: [ConfigModule],
            useFactory: () => ({
                type: "postgres",
                host: "localhost",
                port: 5432,
                username: "postgres",
                password: "root",
                database: "my_dating",
                entities: [
                 User
                ],
                autoLoadEntities: true,
                retryAttempts: 3,
                synchronize: true,
                // logging: false,
                migrations: [
                    __dirname + '/../**/*.migrations{.ts}'
                ]
            }),

            // inject: [ConfigService]
        })

    ],
    controllers: [],
    providers: []
})

export class PostgresModule { };