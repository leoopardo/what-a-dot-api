// src/whatsapp/whatsapp.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RecordsService } from '../records/records.service';

@Controller('webhook')
export class WhatsappController {
  constructor(
    private readonly usersService: UsersService,
    private readonly recordsService: RecordsService,
  ) {}

  @Post()
  async handleMessage(@Body() body: any) {
    const from = body.phone; // número do WhatsApp
    const message = body.message.toLowerCase().trim();

    const user = await this.usersService.findByPhoneNumber(from);
    if (!user) return { reply: 'Usuário não encontrado.' };

    if (message === 'entrada' || message === 'saída') {
      await this.recordsService.createRecord(user, message);
      return { reply: `Ponto de ${message} registrado com sucesso.` };
    }

    return { reply: 'Comando inválido. Use "Entrada" ou "Saída".' };
  }
}
