import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from 'src/common/providers/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<User> {
        const user = await this.usersService.create(signUpDto);

        return user;
    }

    async signIn(signInDto: SignInDto): Promise<{
        refreshToken: string;
        accessToken: string;
    }> {
        const { email, password } = signInDto;
        const user = await this.usersService.findByEmail(email);
        const isValidPassword = user
            ? await bcrypt.compare(password, user.password)
            : false;

        if (!user || !isValidPassword)
            throw new UnauthorizedException({
                errors: {
                    email: 'The provided credentials do not match our records',
                },
            });

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
        const refreshToken = await this.createRefreshToken(payload);
        const accessToken = await this.createAccessToken(payload);

        await this.prismaService.user.update({
            where: {
                id: user.id,
            },
            data: {
                refresh_token: refreshToken,
            },
        });

        return { refreshToken, accessToken };
    }

    async signOut(request: Request): Promise<void> {
        try {
            const refreshToken = request.cookies.refreshToken;

            if (!refreshToken) throw new UnauthorizedException();

            const user = await this.prismaService.user.findUnique({
                where: { refresh_token: refreshToken },
            });

            if (!user) throw new UnauthorizedException();

            await this.prismaService.user.update({
                where: { id: user.id },
                data: {
                    refresh_token: null,
                },
            });
        } catch (error) {
            if (error instanceof JsonWebTokenError)
                throw new UnauthorizedException(error.message);

            throw error;
        }
    }

    async refreshToken(request: Request): Promise<string> {
        try {
            const refreshToken = request.cookies.refreshToken;

            if (!refreshToken) throw new UnauthorizedException();

            const user = await this.prismaService.user.findUnique({
                where: { refresh_token: refreshToken },
            });

            if (!user) throw new UnauthorizedException();

            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>(
                    'REFRESH_TOKEN_SECRET_KEY',
                ),
            });

            const accessToken = await this.createAccessToken({
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
                updated_at: user.updated_at,
            });

            return accessToken;
        } catch (error) {
            if (error instanceof JsonWebTokenError)
                throw new UnauthorizedException(error.message);

            throw error;
        }
    }

    async createRefreshToken(
        payload: object | Buffer,
        expiresIn: string | null = '7d',
    ): Promise<string> {
        const token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
            expiresIn,
        });

        return token;
    }

    async createAccessToken(
        payload: object | Buffer,
        expiresIn: string | null = '15m',
    ): Promise<string> {
        const token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY'),
            expiresIn,
        });

        return token;
    }
}
