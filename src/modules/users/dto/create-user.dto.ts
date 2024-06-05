import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { IsUnique } from 'src/common/validators/is-unique';

export class CreateUserDto {
    @IsNotEmpty()
    name: string;

    @Validate(IsUnique, ['user', 'email'])
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @MinLength(8)
    @IsNotEmpty()
    password: string;
}
