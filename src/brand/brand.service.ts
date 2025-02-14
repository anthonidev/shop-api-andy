import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from 'src/product/entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async findAll(isActive: boolean) {
    const where = isActive ? { isActive: true } : {};

    return await this.brandRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async create(createBrandDto: CreateBrandDto) {
    const brandExists = await this.brandRepository.findOne({
      where: { name: createBrandDto.name },
    });

    if (brandExists) {
      throw new NotFoundException(
        `La marca con el nombre ${createBrandDto.name} ya existe`,
      );
    }
    const brand = this.brandRepository.create(createBrandDto);
    return await this.brandRepository.save(brand);
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    const updatedBrand = this.brandRepository.merge(brand, updateBrandDto);
    return await this.brandRepository.save(updatedBrand);
  }
}
