// src/records/record.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'in' | 'out';

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, user => user.records)
  user: User;
}
