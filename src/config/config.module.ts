import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ConfigurationService } from "./config.service";


@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env`
        })
    ],
    providers: [ConfigService, ConfigurationService],
    exports: [ConfigurationService]

})

export class ConfigurationModule {}