// src/companies/companies.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PlansService } from '../plans/plans.service';
import { Plan } from '../plans/plan.entity';
import { CreateCompanyDto } from './dto/company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly plansService: PlansService
  ) {}

  @Post()
  async create(@Body() body: CreateCompanyDto) {
    const { name, planId, email, password, managerName } = body;

    const plan: Plan | null = await this.plansService.findById(planId);
    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    return this.companiesService.create(name, plan, {
      email,
      password,
      name: managerName,
    });
  }

  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }
}
