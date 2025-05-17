// src/users/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Record } from '../records/record.entity';
import { Company } from 'src/companies/company.entity';
import { IsEmail } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  @IsEmail()
  email?: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phoneNumber?: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isManager: boolean;

  @Column({ nullable: true })
  password?: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Record, (record) => record.user)
  records: Record[];

  @ManyToOne(() => Company, (company) => company.users, { nullable: false })
  company: Company;
}
