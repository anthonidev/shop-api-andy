// src/seed/seed.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Brand } from 'src/product/entities/brand.entity';
import { Category } from 'src/product/entities/category.entity';
import { Product } from 'src/product/entities/product.entity';

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
      { name: 'nike', description: 'Marca deportiva líder mundial' },
      { name: 'adidas', description: 'Innovación en ropa deportiva' },
      { name: 'puma', description: 'Estilo deportivo y urbano' },
      { name: 'reebok', description: 'Equipamiento deportivo de calidad' },
      { name: 'under armour', description: 'Tecnología en ropa deportiva' },
      { name: 'new balance', description: 'Calzado deportivo especializado' },
      { name: 'asics', description: 'Tecnología para running' },
      { name: 'fila', description: 'Moda deportiva clásica' },
      { name: 'converse', description: 'Calzado urbano icónico' },
      { name: 'vans', description: 'Estilo skater y urbano' },
      { name: 'skechers', description: 'Comfort en calzado' },
      { name: 'timberland', description: 'Calzado outdoor' },
      { name: 'dc shoes', description: 'Calzado para skateboarding' },
      { name: 'brooks', description: 'Especialistas en running' },
      { name: 'saucony', description: 'Running de alto rendimiento' },
      { name: 'merrell', description: 'Calzado para aventuras' },
      { name: 'hoka one one', description: 'Innovación en running' },
      { name: 'jordan', description: 'Baloncesto y estilo urbano' },
      { name: 'salomon', description: 'Equipamiento outdoor' },
      { name: 'k-swiss', description: 'Tenis y estilo de vida' },
    ];

    const brands = [];
    for (const brandData of brandsData) {
      const brand = this.brandRepository.create({
        name: brandData.name,
        description: brandData.description,
        logo: faker.image.urlLoremFlickr({ category: 'business' }),
      });
      brands.push(await this.brandRepository.save(brand));
    }
    return brands;
  }

  private async createCategories() {
    const categoriesData = [
      { name: 'running', description: 'Calzado para corredores' },
      { name: 'casual', description: 'Calzado para uso diario' },
      { name: 'training', description: 'Calzado para entrenamiento' },
      { name: 'basketball', description: 'Calzado para baloncesto' },
      { name: 'soccer', description: 'Calzado para fútbol' },
      { name: 'skateboarding', description: 'Calzado para skateboarding' },
      {
        name: 'outdoor',
        description: 'Calzado para actividades al aire libre',
      },
      { name: 'tennis', description: 'Calzado para tenis' },
      { name: 'lifestyle', description: 'Calzado de moda' },
      { name: 'walking', description: 'Calzado para caminata' },
    ];

    const categories = [];
    for (const categoryData of categoriesData) {
      const category = this.categoryRepository.create({
        name: categoryData.name,
        description: categoryData.description,
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
