import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'producto' })
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  name: string;
  price: number;
}
