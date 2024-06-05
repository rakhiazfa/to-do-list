import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import AuthUser from 'src/common/decorators/auth-user.decorator';
import { User } from '@prisma/client';

@Controller('checklists')
export class ChecklistsController {
    constructor(private readonly checklistsService: ChecklistsService) {}

    @UseGuards(AuthGuard)
    @Post()
    async create(
        @Body() createChecklistDto: CreateChecklistDto,
        @AuthUser() user: User,
    ) {
        await this.checklistsService.create(createChecklistDto, user);

        return {
            message: 'Checklist created successfully',
        };
    }

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@AuthUser() user: User) {
        const checklists = await this.checklistsService.findAll(user);

        return {
            checklists,
        };
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async findById(@Param('id') id: string, @AuthUser() user: User) {
        const checklist = await this.checklistsService.findById(id, user);

        return {
            checklist,
        };
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateChecklistDto: UpdateChecklistDto,
        @AuthUser() user: User,
    ) {
        await this.checklistsService.update(id, updateChecklistDto, user);

        return {
            message: 'Checklist updated successfully',
        };
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @AuthUser() user: User) {
        await this.checklistsService.remove(id, user);

        return {
            message: 'Checklist deleted successfully',
        };
    }
}
