import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [TypeOrmModule.forFeature([Product, Brand, Category])],
  exports: [TypeOrmModule],
})
export class ProductModule {}
