// src/companies/company.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Plan } from '../plans/plan.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, user => user.company)
  users: User[];

  @ManyToOne(() => Plan, plan => plan.companies)
  plan: Plan;

  @Column({ type: 'boolean', default: true })
  isTrial: boolean;

  @Column({ type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'boolean', default: false })
  isPaymentActive: boolean;
}
