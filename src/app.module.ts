// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RecordsModule } from './records/records.module';
import { CompaniesModule } from './companies/companies.module';
import { PlansModule } from './plans/plans.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'whatadot',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    RecordsModule,
    CompaniesModule,
    PlansModule,
    AuthModule,
  ],
})
export class AppModule {}
