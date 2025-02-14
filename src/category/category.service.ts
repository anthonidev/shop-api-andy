import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from 'src/product/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(isActive: boolean) {
    const where = isActive ? { isActive: true } : {};
    return await this.categoryRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const categoryExists = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (categoryExists) {
      throw new NotFoundException(
        `La categoría con el nombre ${createCategoryDto.name} ya existe`,
      );
    }
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const updatedCategory = this.categoryRepository.merge(
      category,
      updateCategoryDto,
    );
    return await this.categoryRepository.save(updatedCategory);
  }
}
