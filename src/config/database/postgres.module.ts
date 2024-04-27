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
                // host: "localhost",
                // port: 5432,
                // username: "postgres",
                // password: "root",
                // database: "my_dating_test",
                database: "my_dating",
                host: "ep-orange-cell-a55es4i9.us-east-2.aws.neon.tech",
                port: 5432,
                username: "my_dating_owner",
                password: "u2nLBvmgV0Ij",
                ssl:true,
                entities: [
                //  User
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