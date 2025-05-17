// src/companies/companies.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PlansService } from '../plans/plans.service';
import { Plan } from '../plans/plan.entity';
import { CreateCompanyDto } from './dto/company.dto';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard('jwt'))
  @Post('payment')
  async createPayment(
    @Body() body: { paymentStatus: number },
    @Req() req: any
  ) {
    const companyId = req.user.companyId;
    return this.companiesService.registerPayment(body, companyId);
  }

  @UseGuards()
  @Post('confirm-payment')
  async confirmPaymentWebhook(@Body() body: any) {
    // TODO - implementar alguma plataforma de pagamento e webhhok
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
