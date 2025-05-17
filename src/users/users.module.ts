import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Company } from 'src/companies/company.entity';
import { CompaniesModule } from 'src/companies/companies.module';
import { CheckCompanyPlanGuard } from 'src/common/guards/check-company-plan.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Company]),
    CompaniesModule,
  ],
  providers: [UsersService, CheckCompanyPlanGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
