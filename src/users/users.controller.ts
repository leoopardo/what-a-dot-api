// src/users/users.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

//   @Post('create-manager')
//   async createManager(@Body() createUserDto: CreateUserDto) {
//     return this.usersService.createManager(createUserDto);
//   }

  @Post('create/:companyId')
  async createUserForCompany(
    @Body() createUserDto: CreateUserDto,
    @Param('companyId') companyId: string
  ) {
    return this.usersService.createUserForCompany(companyId, createUserDto);
  }

  @Get(':id')
  async findByPhone(@Param('phone') phone: string) {
    return this.usersService.findByPhoneNumber(phone);
  }
}
