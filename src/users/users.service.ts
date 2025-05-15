// src/users/users.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Company } from 'src/companies/company.entity';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) {}

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phoneNumber } });
  }

  // opcional: criar usuário manualmente
  async create(
    name: string,
    phoneNumber: string,
    isAdmin = false
  ): Promise<User> {
    const user = this.userRepository.create({ name, phoneNumber, isAdmin });
    return this.userRepository.save(user);
  }

  async createUserForCompany(companyId: string, userData: CreateUserDto) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users', 'plan'],
    });

    if (!company) throw new NotFoundException('Empresa não encontrada');

    const now = new Date();

    const isTrialExpired =
      company.isTrial && company.trialEndsAt && company.trialEndsAt < now;
    const canAddUser =
      company.isPaymentActive || (company.isTrial && !isTrialExpired);

    if (!canAddUser) {
      throw new ForbiddenException(
        'Plano inativo ou período de teste expirado'
      );
    }

    if (company.users.length >= company.plan.maxUsers) {
      throw new ForbiddenException(
        'Limite de usuários atingido para este plano'
      );
    }

    const user = this.userRepository.create({ ...userData });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.userRepository.findOne({ where: { email } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Usuário não encontrado');
      } else {
        throw error;
      }
    }
  }
}
