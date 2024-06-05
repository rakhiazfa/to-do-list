import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import AuthUser from 'src/common/decorators/auth-user.decorator';
import { User } from '@prisma/client';

@Controller('checklists/:checklistId/todos')
export class TodosController {
    constructor(private readonly todosService: TodosService) {}

    @UseGuards(AuthGuard)
    @Post()
    async create(
        @Param('checklistId') checklistId: string,
        @Body() createTodoDto: CreateTodoDto,
        @AuthUser() user: User,
    ) {
        await this.todosService.create(checklistId, createTodoDto, user);

        return {
            message: 'To do created successfully',
        };
    }

    @UseGuards(AuthGuard)
    @Get()
    async findAll(
        @Param('checklistId') checklistId: string,
        @AuthUser() user: User,
    ) {
        const todos = await this.todosService.findAll(checklistId, user);

        return { todos };
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async findById(
        @Param('checklistId') checklistId: string,
        @Param('id') id: string,
        @AuthUser() user: User,
    ) {
        const todo = await this.todosService.findById(checklistId, id, user);

        return { todo };
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async update(
        @Param('checklistId') checklistId: string,
        @Param('id') id: string,
        @Body() updateTodoDto: UpdateTodoDto,
        @AuthUser() user: User,
    ) {
        await this.todosService.update(checklistId, id, updateTodoDto, user);

        return {
            message: 'To do updated successfully',
        };
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(
        @Param('checklistId') checklistId: string,
        @Param('id') id: string,
        @AuthUser() user: User,
    ) {
        await this.todosService.remove(checklistId, id, user);

        return {
            message: 'To do deleted successfully',
        };
    }

    @UseGuards(AuthGuard)
    @Patch(':id/toggle-status')
    async toggleStatus(
        @Param('checklistId') checklistId: string,
        @Param('id') id: string,
        @AuthUser() user: User,
    ) {
        await this.todosService.toggleStatus(checklistId, id, user);

        return {
            message: 'To do status updated successfully',
        };
    }
}
