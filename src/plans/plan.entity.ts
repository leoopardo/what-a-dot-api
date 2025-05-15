// src/plans/plan.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Company } from '../companies/company.entity';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  maxUsers: number;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  price: number;

  @OneToMany(() => Company, (company) => company.plan)
  companies: Company[];
}
