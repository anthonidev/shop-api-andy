import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';

@Module({
  controllers: [BrandController],
  providers: [BrandService],
  imports: [TypeOrmModule, ProductModule],
})
export class BrandModule {}
