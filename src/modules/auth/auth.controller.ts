import {
    Controller,
    Post,
    Body,
    Get,
    HttpCode,
    HttpStatus,
    Res,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from '@prisma/client';
import AuthUser from 'src/common/decorators/auth-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @HttpCode(HttpStatus.OK)
    async signUp(@Body() signUpDto: SignUpDto) {
        const user = await this.authService.signUp(signUpDto);

        return {
            message: 'Registration successful',
        };
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body() signInDto: SignInDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const { refreshToken, accessToken } =
            await this.authService.signIn(signInDto);

        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return { accessToken };
    }

    @Post('signout')
    @HttpCode(HttpStatus.OK)
    async signOut(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.signOut(request);
        response.clearCookie('refreshToken');

        return {
            message: 'Signed out successful',
        };
    }

    @UseGuards(AuthGuard)
    @Get('user')
    async user(@AuthUser() user: User) {
        return { user };
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() request: Request) {
        const accessToken = await this.authService.refreshToken(request);

        return { accessToken };
    }
}
