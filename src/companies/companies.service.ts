// src/companies/companies.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { Plan } from 'src/plans/plan.entity';
import dayjs from 'dayjs';
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
  ): Promise<Company> {
    const user = this.userRepository.create({
      name: managerData.name,
      email: managerData.email,
      password: bcrypt.hashSync(managerData.password, 10),
      isManager: true,
    });

    const company = this.companyRepository.create({
      name,
      plan,
      isTrial: true,
      trialEndsAt: dayjs().add(14, 'days').toDate(),
      users: [user],
    });

    return this.companyRepository.save(company);
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
}
