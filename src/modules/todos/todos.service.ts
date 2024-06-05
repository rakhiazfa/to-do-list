import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from 'src/common/providers/prisma/prisma.service';
import { Todo, User } from '@prisma/client';
import { ChecklistsService } from '../checklists/checklists.service';

@Injectable()
export class TodosService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly checklistsService: ChecklistsService,
    ) {}

    async create(
        checklistId: string,
        createTodoDto: CreateTodoDto,
        user: User,
    ) {
        const { title, description } = createTodoDto;
        const checklist = await this.checklistsService.findById(
            checklistId,
            user,
        );

        return await this.prismaService.todo.create({
            data: {
                title,
                description,
                is_finished: false,
                checklist_id: checklist.id,
            },
        });
    }

    async findAll(checklistId: string, user: User): Promise<Todo[]> {
        const checklist = await this.checklistsService.findById(
            checklistId,
            user,
        );
        const todos = this.prismaService.todo.findMany({
            where: {
                checklist_id: checklist.id,
            },
        });

        return todos;
    }

    async findById(checklistId: string, id: string, user: User) {
        const todo = await this.prismaService.todo.findUnique({
            where: {
                id,
                checklist_id: checklistId,
            },
        });

        if (!todo) throw new NotFoundException('To do not found.');

        return todo;
    }

    async update(
        checklistId: string,
        id: string,
        updateTodoDto: UpdateTodoDto,
        user: User,
    ) {
        const { title, description } = updateTodoDto;
        const todo = await this.findById(checklistId, id, user);

        return await this.prismaService.todo.update({
            where: {
                id: todo.id,
            },
            data: {
                title,
                description,
            },
        });
    }

    async remove(checklistId: string, id: string, user: User) {
        const todo = await this.findById(checklistId, id, user);

        return await this.prismaService.todo.delete({
            where: {
                id: todo.id,
            },
        });
    }

    async toggleStatus(checklistId: string, id: string, user: User) {
        const todo = await this.findById(checklistId, id, user);

        return await this.prismaService.todo.update({
            where: {
                id: todo.id,
            },
            data: {
                is_finished: !todo.is_finished,
            },
        });
    }
}
