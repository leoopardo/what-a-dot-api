import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { UsersModule } from 'src/users/users.module';
import { RecordsModule } from 'src/records/records.module';

@Module({
  controllers: [WhatsappController],
  imports: [UsersModule, RecordsModule],
})
export class WhatsappModule {}
