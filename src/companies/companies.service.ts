// src/companies/companies.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { Plan } from 'src/plans/plan.entity';
import * as dayjs from 'dayjs';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) {}

  async create(
    name: string,
    plan: Plan,
    managerData: { name: string; email: string; password: string }
  ): Promise<Company | null> {
    // TODO - a empresa deve ser criada com free trial de 60 dias;
    // o free trial deve acabar quando exceder 60 dias ou quando a empresa gerar
    // o primeiro cartão ponto mensal;
    const company = this.companyRepository.create({
      name,
      plan,
      isTrial: true,
      trialEndsAt: dayjs().add(60, 'days').toDate(),
    });
    await this.companyRepository.save(company);

    const user = this.userRepository.create({
      name: managerData.name,
      email: managerData.email,
      password: bcrypt.hashSync(managerData.password, 10),
      isManager: true,
      phoneNumber: '',
      company,
    });
    await this.userRepository.save(user);

    return this.companyRepository.findOne({
      where: { id: company.id },
      relations: ['users'],
    });
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({ relations: ['users'] });
  }

  async findById(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async registerPayment(body: { paymentStatus: number }, companyId: string) {
    if (body.paymentStatus !== 2) {
      throw new BadRequestException('Pagamento recusado!');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    const now = new Date();

    if (dayjs(now).add(1, 'day').isBefore(company?.nextPaymentDue)) {
      throw new BadRequestException(
        `Seu plano ainda está vigente, a data de vencimento é ${dayjs(company?.nextPaymentDue).toISOString()}!`
      );
    }

    await this.companyRepository.update(companyId, {
      nextPaymentDue: dayjs().add(31, 'days').toDate(),
    });

    return {
      message: `Pagamento registrado, próxima data de cobrança: ${dayjs().add(31, 'days').startOf('D').toISOString()} `,
    };
  }
}
