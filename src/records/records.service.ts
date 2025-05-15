// src/records/records.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from './record.entity';
import { User } from '../users/user.entity';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
  ) {}

  async createRecord(user: User, type: 'entrada' | 'saida'): Promise<Record> {
    const record = this.recordRepository.create({ user, type });
    return this.recordRepository.save(record);
  }

  // opcional: buscar registros do usuário
  async findByUser(user: User): Promise<Record[]> {
    return this.recordRepository.find({
      where: { user },
      order: { timestamp: 'DESC' },
    });
  }
}
