import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import ucfirst from '../utils/ucfirst';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        const object = plainToInstance(metatype, value);
        const errors = await validate(object, {
            whitelist: true,
            stopAtFirstError: true,
        });

        if (errors.length > 0) {
            throw new BadRequestException({
                errors: errors.reduce(
                    (initial: object, error: ValidationError) => {
                        initial[error.property] = ucfirst(
                            error.constraints[
                                Object.keys(error.constraints)[0]
                            ],
                        );

                        return initial;
                    },
                    {},
                ),
            });
        }

        return value;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];

        return !types.includes(metatype);
    }
}
