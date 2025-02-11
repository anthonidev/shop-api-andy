import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Product } from './product.entity';
import { IsString, MinLength } from 'class-validator';

@Entity({ name: 'marcas' })
export class Brand {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  logo: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @OneToMany(() => Product, (product) => product.brand, {
    cascade: true,
  })
  products: Product[];

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
  async transform() {
    this.name = this.name.toLowerCase().trim();
  }
}
