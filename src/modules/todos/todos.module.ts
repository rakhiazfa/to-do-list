import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { ChecklistsService } from '../checklists/checklists.service';

@Module({
    controllers: [TodosController],
    providers: [TodosService, ChecklistsService],
})
export class TodosModule {}
