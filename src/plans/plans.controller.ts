// src/plans/plans.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Post()
  create(@Body() body: { name: string; maxUsers: number; price: number }) {
    const { name, maxUsers, price } = body;
    return this.plansService.create(name, maxUsers, price);
  }

  @Post('seed')
  seed() {
    return this.plansService.seedDefaultPlans();
  }
}
