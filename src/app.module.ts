import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { BottlesModule } from './bottles/bottles.module';
import { MaterialModule } from './materials/material.module';
import { PassageModule } from './passages/passage.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRoot({
            type: 'mariadb',
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: ['dist/**/*.entity{.ts,.js}'],
            // TODO ATTENTION passer à "false" en prod
            synchronize: true
        }),
        MailerModule.forRoot({
            transport: {
                host: process.env.MAILER_HOST,
                secure: false,
                auth: {
                    user: process.env.MAILER_USER,
                    pass: process.env.MAILER_PASSWORD
                },
            },
            defaults: {
                from: process.env.MAILER_FROM
            },
            template: {
                dir: __dirname + '/templates',
                adapter: new PugAdapter(),
                options: {
                    strict: true
                }
            }
        }),
        AuthModule,
        UsersModule,
        BottlesModule,
        MaterialModule,
        PassageModule,
        OrdersModule
    ],
    controllers: [AppController]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        // consumer.apply(HelmetMiddleware);
    }
}
