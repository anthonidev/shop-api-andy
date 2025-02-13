// src/seed/seed.service.ts
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/product/entities/brand.entity';
import { Category } from 'src/product/entities/category.entity';
import { Product } from 'src/product/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async runSeed() {
    // Limpiar la base de datos
    await this.deleteData();

    // Crear marcas y categorías
    const brands = await this.createBrands();
    const categories = await this.createCategories();

    // Crear productos
    await this.createProducts(brands, categories);

    return 'Seed ejecutado correctamente';
  }

  private async deleteData() {
    await this.productRepository.delete({});
    await this.brandRepository.delete({});
    await this.categoryRepository.delete({});
  }

  private async createBrands() {
    const brandsData = [
      { name: 'nike' },
      { name: 'adidas' },
      { name: 'puma' },
      { name: 'reebok' },
      { name: 'under armour' },
      { name: 'new balance' },
      { name: 'asics' },
      { name: 'fila' },
      { name: 'converse' },
      { name: 'vans' },
      { name: 'skechers' },
      { name: 'timberland' },
      { name: 'dc shoes' },
      { name: 'brooks' },
      { name: 'saucony' },
      { name: 'merrell' },
      { name: 'hoka one one' },
      { name: 'jordan' },
      { name: 'salomon' },
      { name: 'k-swiss' },
    ];

    const brands = [];
    for (const brandData of brandsData) {
      const brand = this.brandRepository.create({
        name: brandData.name,
      });
      brands.push(await this.brandRepository.save(brand));
    }
    return brands;
  }

  private async createCategories() {
    const categoriesData = [
      { name: 'running' },
      { name: 'casual' },
      { name: 'training' },
      { name: 'basketball' },
      { name: 'soccer' },
      { name: 'skateboarding' },
      { name: 'outdoor' },
      { name: 'tennis' },
      { name: 'lifestyle' },
      { name: 'walking' },
    ];

    const categories = [];
    for (const categoryData of categoriesData) {
      const category = this.categoryRepository.create({
        name: categoryData.name,
      });
      categories.push(await this.categoryRepository.save(category));
    }
    return categories;
  }

  private async createProducts(brands: Brand[], categories: Category[]) {
    const products = [];

    for (let i = 0; i < 100; i++) {
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      const productName = `${randomBrand.name} ${faker.commerce.productName().toLowerCase()}`;

      const product = this.productRepository.create({
        name: productName,
        price: parseFloat(faker.commerce.price({ min: 50, max: 200 })),
        photo: faker.image.urlLoremFlickr({ category: 'shoes' }),
        brandId: randomBrand.id,
        categoryId: randomCategory.id,
        brand: randomBrand,
        category: randomCategory,
      });

      products.push(await this.productRepository.save(product));
    }

    return products;
  }
}
