import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { envs } from './config/envs';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'ShopDB',
        username: 'postgres',
        password: '123',
        autoLoadEntities: true,
        // synchronize: envs.environment !== 'production',
        synchronize: true,
      }),
    }),
    ProductModule,
    AuthModule,
  ],
})
export class AppModule {}
