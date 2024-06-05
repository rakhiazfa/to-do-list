import { IsNotEmpty } from 'class-validator';

export class UpdateChecklistDto {
    @IsNotEmpty()
    name: string;
}
