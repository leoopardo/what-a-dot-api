// src/companies/companies.service.ts
import { Injectable } from '@nestjs/common';
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
    // Primeiro criamos a empresa sem usuários ainda
    const company = this.companyRepository.create({
      name,
      plan,
      isTrial: true,
      trialEndsAt: dayjs().add(14, 'days').toDate(),
    });
    await this.companyRepository.save(company);

    // Agora criamos o manager e associamos à empresa
    const user = this.userRepository.create({
      name: managerData.name,
      email: managerData.email,
      password: bcrypt.hashSync(managerData.password, 10),
      isManager: true,
      phoneNumber: '',
      company, // aqui acontece o vínculo real
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
}
