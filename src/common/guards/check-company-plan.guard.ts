// src/common/guards/check-company-plan.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import { CompaniesService } from 'src/companies/companies.service';

@Injectable()
export class CheckCompanyPlanGuard implements CanActivate {
  constructor(private readonly companiesService: CompaniesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const companyId = user?.companyId || request.body?.companyId;

    if (!companyId) {
      throw new ForbiddenException('É necessário informar a empresa');
    }

    const company = await this.companiesService.findById(companyId);

    if (!company) {
      throw new ForbiddenException('Empresa não encontrada');
    }

    const now = new Date();
    const trialExpired =
      company.isTrial && company?.trialEndsAt && company?.trialEndsAt < now;
    const paymentOverdue =
      !company.isTrial &&
      company.nextPaymentDue &&
      dayjs(company.nextPaymentDue).add(1, 'day').isBefore(now);

    if (trialExpired && !company.nextPaymentDue) {
      throw new HttpException(
        `O plano de teste expirou. Por favor, realize um upgrade de plano para continuar utilizando o WhatADot.`,
        402
      );
    }

    if (paymentOverdue) {
      throw new HttpException(
        `Sua empesa possui pagamentos pendentes. Após a confirmação do pagamento, você poderá realizar essa ação normalmente.`,
        402
      );
    }

    return true;
  }
}
