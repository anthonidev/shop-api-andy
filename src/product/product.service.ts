import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Not, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    // Verificar si el producto ya existe
    const productExists = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });

    if (productExists) {
      throw new ConflictException(
        `El producto con el nombre ${createProductDto.name} ya existe`,
      );
    }

    let photoUrl: string | undefined;

    // Solo subir la imagen si se proporcionó un archivo
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      photoUrl = uploadResult.url;
    }

    // Crear el producto con o sin foto
    const product = this.productRepository.create({
      ...createProductDto,
      photo: photoUrl, // será undefined si no se subió archivo
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
      .orderBy('product.updatedAt', 'DESC')
      .addOrderBy('product.createdAt', 'DESC')
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

    if (updateProductDto.name) {
      const existingProduct = await this.productRepository.findOne({
        where: {
          name: updateProductDto.name.toLowerCase().trim(),
          id: Not(id),
        },
      });

      if (existingProduct) {
        throw new ConflictException(
          `Producto con el nombre ${updateProductDto.name} ya existe`,
        );
      }
    }
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);

      if (product.photo) {
        try {
          // Extraer el public_id de la URL antigua
          const publicId = this.extractPublicId(product.photo);
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      updateProductDto.photo = uploadResult.url;
    }

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
