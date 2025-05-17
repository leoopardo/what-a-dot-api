// src/users/dto/create-user.dto.ts
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Company } from 'src/companies/company.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  company: Company;

  @IsBoolean()
  @IsOptional()
  isManager?: boolean;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
