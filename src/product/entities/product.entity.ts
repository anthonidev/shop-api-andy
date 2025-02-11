import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';
import { Category } from './category.entity';
import { Brand } from './brand.entity';

@Entity({ name: 'productos' })
@Index(['name', 'brandId'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    default: null,
  })
  photo: string | null;

  @Column({ type: 'int', nullable: true, name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'int', nullable: true, name: 'brand_id' })
  brandId: number;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    if (this.price < 0) throw new Error('El precio no puede ser negativo');
    this.name = this.name.toLowerCase().trim();
  }
}
