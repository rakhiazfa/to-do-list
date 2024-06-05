import { Injectable } from '@nestjs/common';
import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '../providers/prisma/prisma.service';

@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
@Injectable()
export class IsUnique implements ValidatorConstraintInterface {
    constructor(private readonly prismaService: PrismaService) {}

    async validate(value: any, args?: ValidationArguments): Promise<boolean> {
        const [tableName, column] = args?.constraints as string[];

        const dataExist = await this.prismaService[tableName].findFirst({
            where: {
                [column]: value,
            },
        });

        return !dataExist;
    }

    defaultMessage(validationArguments: ValidationArguments): string {
        const field = validationArguments.property;

        return `${field} is already exist.`;
    }
}
