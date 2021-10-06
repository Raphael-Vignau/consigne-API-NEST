import {
    Body,
    Controller,
    DefaultValuePipe, Delete,
    Get, NotFoundException, Param,
    ParseIntPipe,
    Post, Put,
    Query, Res, UploadedFile, UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user.role';
import { MaterialEntity } from './entities/material.entity';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter } from '../utils/file-upload.utils';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { UpdateResult } from 'typeorm';
import { existsSync } from 'fs';

@Controller('materials')
export class MaterialController {

    constructor(
        private readonly bottlesService: MaterialsService
    ) {
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    async findMaterials(
        @Query('name_contains', new DefaultValuePipe('')) contains,
        @Query('_sort', new DefaultValuePipe('name')) sortBy,
        @Query('_direction', new DefaultValuePipe('ASC')) sortDirection,
        @Query('_start', new DefaultValuePipe(0), ParseIntPipe) start,
        @Query('_limit', new DefaultValuePipe(3), ParseIntPipe) limit
    ): Promise<MaterialEntity[]> {
        const order = {
            [sortBy]: sortDirection.toUpperCase()
        };
        return await this.bottlesService.findMaterials(contains, start, limit, order);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('export')
    async findAll(): Promise<MaterialEntity[]> {
        return await this.bottlesService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('count')
    async countMaterials(): Promise<Number> {
        return await this.bottlesService.countMaterials();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    @UseInterceptors(
        FileInterceptor(
            'img_material',
            {
                storage: diskStorage({ destination: process.env.PATH_FILES_MATERIAL }),
                fileFilter: fileFilter
            }))
    async createMaterial(
        @Body() newMaterial: CreateMaterialDto,
        @UploadedFile() imgMaterial: Express.Multer.File
    ): Promise<MaterialEntity> {
        return await this.bottlesService.createMaterial(newMaterial, imgMaterial);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put(':id')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'img_material', maxCount: 1 }
            ], {
                storage: diskStorage({ destination: process.env.PATH_FILES_MATERIAL }),
                fileFilter: fileFilter
            }
        ))
    async updateMaterial(
        @Param('id') id: string,
        @Body() bottle: UpdateMaterialDto,
        @UploadedFiles() filesMaterial: { img_material?: Express.Multer.File[] }
    ): Promise<MaterialEntity> {
        return await this.bottlesService.updateMaterial(id, bottle, filesMaterial);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async deleteMaterial(@Param('id') id: string): Promise<UpdateResult> {
        return await this.bottlesService.deleteMaterial(id);
    }

    @Get('file/:filePath')
    seeUploadedFile(@Param('filePath') fileName, @Res() res) {
        let filePath = process.env.PATH_FILES_MATERIAL + fileName;
        if (existsSync(filePath)) {
            return res.sendFile(fileName, {
                root: process.env.PATH_FILES_MATERIAL
            });
        }
        throw new NotFoundException();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get(':id')
    async findOneMaterial(@Param('id') id: string): Promise<MaterialEntity> {
        return await this.bottlesService.findOneMaterialById(id);
    }
}