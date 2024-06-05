import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './common/providers/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { IsUnique } from './common/validators/is-unique';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { TodosModule } from './modules/todos/todos.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({ global: true }),
        AuthModule,
        PrismaModule,
        UsersModule,
        ChecklistsModule,
        TodosModule,
    ],
    providers: [IsUnique],
})
export class AppModule {}
