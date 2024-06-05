import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { PrismaService } from 'src/common/providers/prisma/prisma.service';
import { Checklist, User } from '@prisma/client';

@Injectable()
export class ChecklistsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(
        createChecklistDto: CreateChecklistDto,
        user: User,
    ): Promise<Checklist> {
        const { name } = createChecklistDto;

        return await this.prismaService.checklist.create({
            data: {
                user_id: user.id,
                name,
            },
        });
    }

    async findAll(user: User): Promise<Checklist[]> {
        const checklists = await this.prismaService.checklist.findMany({
            where: {
                user_id: user.id,
            },
        });

        return checklists;
    }

    async findById(id: string, user: User): Promise<Checklist> {
        const checklists = await this.prismaService.checklist.findUnique({
            where: {
                id,
                user_id: user.id,
            },
            include: { todos: true },
        });

        if (!checklists) throw new NotFoundException('Checklist not found.');

        return checklists;
    }

    async update(
        id: string,
        updateChecklistDto: UpdateChecklistDto,
        user: User,
    ): Promise<Checklist> {
        const { name } = updateChecklistDto;
        const checklist = await this.findById(id, user);

        return await this.prismaService.checklist.update({
            where: {
                id: checklist.id,
            },
            data: {
                name,
            },
        });
    }

    async remove(id: string, user: User): Promise<Checklist> {
        const checklist = await this.findById(id, user);

        return await this.prismaService.checklist.delete({
            where: {
                id: checklist.id,
            },
        });
    }
}
