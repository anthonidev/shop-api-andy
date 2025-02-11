import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    // Subir imagen a Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(file);

    // Crear el producto con la URL de la imagen
    const product = this.productRepository.create({
      ...createProductDto,
      photo: uploadResult.url,
    });

    return await this.productRepository.save(product);
  }

  async findAll(
    filterProductDto: FilterProductDto,
    paginationDto: PaginationDto,
  ) {
    const { limit = 10, offset = 0 } = paginationDto;
    const { name, categoryId, brandId, minPrice, maxPrice, isActive } =
      filterProductDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .take(limit)
      .skip(offset);

    if (name) {
      queryBuilder.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, file?: any) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Si hay una nueva imagen
    if (file) {
      // Subir la nueva imagen
      const uploadResult = await this.cloudinaryService.uploadImage(file);

      // Si el producto ya tenía una imagen, intentar eliminarla
      if (product.photo) {
        try {
          // Extraer el public_id de la URL antigua
          const publicId = this.extractPublicId(product.photo);
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
          // Continuamos con la actualización aunque falle el borrado
        }
      }

      // Actualizar la URL de la imagen
      updateProductDto.photo = uploadResult.url;
    }

    // Actualizar el producto
    const updatedProduct = this.productRepository.merge(
      product,
      updateProductDto,
    );
    return await this.productRepository.save(updatedProduct);
  }
  async remove(id: number) {
    const product = await this.findOne(id);
    product.isActive = false;
    return await this.productRepository.save(product);
  }

  async findByCategory(categoryId: number, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.categoryId = :categoryId', { categoryId })
      .andWhere('product.isActive = true')
      .take(limit)
      .skip(offset);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      limit,
      offset,
    };
  }
  private extractPublicId(url: string): string | null {
    try {
      // La URL de Cloudinary suele ser algo como:
      // https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/image-id.jpg
      const matches = url.match(/\/v\d+\/(.+?)\./);
      return matches ? matches[1] : null;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }
  async findByBrand(brandId: number, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.brandId = :brandId', { brandId })
      .andWhere('product.isActive = true')
      .take(limit)
      .skip(offset);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      limit,
      offset,
    };
  }
}
