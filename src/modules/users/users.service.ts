import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/common/providers/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { name, email, password } = createUserDto;

        const salt = await bcrypt.genSalt();
        const user = await this.prismaService.user.create({
            data: {
                name,
                email,
                password: await bcrypt.hash(password, salt),
            },
        });

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        });

        return user;
    }
}
