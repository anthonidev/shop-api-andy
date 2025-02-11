import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [TypeOrmModule, ProductModule],
})
export class SeedModule {}
