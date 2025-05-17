// src/users/users.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PaginatedResponse } from 'src/types/response.interface';
import { User } from './user.entity';
import { queryParams } from 'src/types/queryParams.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //   @Post('create-manager')
  //   async createManager(@Body() createUserDto: CreateUserDto) {
  //     return this.usersService.createManager(createUserDto);
  //   }
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createUserForCompany(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ) {
    const companyId = (req as any).user.companyId;
    return this.usersService.createUserForCompany(companyId, createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findByPhone(@Param('phone') phone: string) {
    return this.usersService.findByPhoneNumber(phone);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get("")
  async findAll(@Req() req: Request, @Query() query: queryParams<User>) {
    const companyId = (req as any).user.companyId;
    return this.usersService.findAll(companyId, query);
  }
}
