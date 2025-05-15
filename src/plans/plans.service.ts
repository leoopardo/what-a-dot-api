// src/plans/plans.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './plan.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async findAll(): Promise<Plan[]> {
    return this.planRepo.find();
  }

  async findById(id: string): Promise<Plan | null> {
    return this.planRepo.findOne({ where: { id } });
  }

  async create(name: string, maxUsers: number, price: number): Promise<Plan> {
    const plan = this.planRepo.create({ name, maxUsers, price });
    return this.planRepo.save(plan);
  }

  async seedDefaultPlans(): Promise<void> {
    const defaults = [
      { name: 'Starter', maxUsers: 5, price: 0 },
      { name: 'Pro', maxUsers: 20, price: 99.9 },
      { name: 'Enterprise', maxUsers: 100, price: 299.9 },
    ];

    for (const p of defaults) {
      const exists = await this.planRepo.findOne({ where: { name: p.name } });
      if (!exists) {
        await this.planRepo.save(this.planRepo.create(p));
      }
    }
  }
}
