// src/users/users.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Company } from 'src/companies/company.entity';
import { CreateUserDto } from './dto/user.dto';
import { PaginatedResponse } from 'src/types/response.interface';
import { queryParams } from 'src/types/queryParams.interface';

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
    try {
      const userExists = await this.userRepository.findOne({
        where: { phoneNumber: userData.phoneNumber },
        relations: ['company'],
      });

      const mandatoryFields = ['name', 'phoneNumber'];

      const missingFields = mandatoryFields.filter(
        (field) => !userData[field as keyof CreateUserDto]
      );

      if (missingFields.length > 0) {
        throw new BadRequestException(
          `Os seguintes campos são obrigatórios: ${missingFields.join(', ')}`
        );
      }

      if (userExists) {
        throw new BadRequestException(
          `Esse telefone já está cadastrado na empresa: ${userExists.company.name}`
        );
      }

      const isPhoneNumberValid = /^\(?\d{2}\)?\s?(9?\d{4})-?\d{4}$/.test(
        userData?.phoneNumber as string
      );
      if (!isPhoneNumberValid) {
        throw new BadRequestException('O número de telefone não é válido.');
      }

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

      if (
        company.users.filter((user) => !user.isManager && !user.isAdmin)
          .length >= company.plan.maxUsers
      ) {
        throw new ForbiddenException(
          `Limite de funcionários atingido para o plano '${company.plan.name}', realize o upgrade do plano para continuar adicionando colaboradores.`
        );
      }

      const user = this.userRepository.create({ ...userData, company });

      // TODO - implementar mensagem de boas vindas no whatsapp do usuário cadastrado

      return this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Usuário não encontrado');
      } else if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      } else {
        throw error;
      }
    }
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

  async findById(id: string): Promise<User | null> {
    try {
      return this.userRepository.findOne({
        where: { id },
        relations: ['company'],
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Usuário não encontrado');
      } else {
        throw error;
      }
    }
  }

  async findAll(
    companyId: string,
    query: queryParams<User>
  ): Promise<PaginatedResponse<User>> {
    try {
      const qb = this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.company', 'company')
        .where('company.id = :companyId', { companyId });

      if (query.search) {
        qb.andWhere(
          '(user.name LIKE :search OR user.phoneNumber LIKE :search)',
          {
            search: `%${query.search}%`,
          }
        );
      }

      const page = +query.page || 1;
      const limit = +query.limit || 10;
      const offset = (page - 1) * limit;

      const orderBy = query.orderBy
        ? `user.${query.orderBy}`
        : 'user.createdAt';
      const order = query.order || 'DESC';
      qb.orderBy(orderBy, order.toUpperCase() as 'ASC' | 'DESC');

      // Paginação
      qb.skip(offset).take(limit);

      const [users, total] = await qb.getManyAndCount();

      const sanatizedUsers = users.map((user) => {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
      });

      return {
        data: sanatizedUsers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Usuário não encontrado');
      } else {
        throw error;
      }
    }
  }

  // TODO - implementar a opção do usuário de sair da empresa ao enviar /Sair da empresa mo whatsapp
  // aqui será um webhook do whatsapp que ao receber a mensagem /Sair da empresa chama esse método
  async leaveCompanyByPhoneNumber(phoneNumber: string) {}
}
