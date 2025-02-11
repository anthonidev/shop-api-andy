import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsEmail, MinLength } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  @MinLength(4)
  username: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  @IsEmail()
  email: string;

  @Column('text', {
    select: false,
    nullable: false,
  })
  @Exclude()
  @MinLength(6)
  password: string;

  @Column('text', {
    nullable: false,
  })
  fullName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('text', { nullable: true })
  lastLoginAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  emailToLowerCase() {
    this.email = this.email.toLowerCase().trim();
    this.username = this.username.toLowerCase().trim();
  }
}
