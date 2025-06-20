// alerts.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CreateAlertDto } from './dto/create-alert.dto'; // Importe o DTO

@ApiBearerAuth('access-token')
@ApiTags('alertas')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private svc: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo alerta de queda' })
  @ApiResponse({ status: 201, description: 'Alerta criado com sucesso e enviado aos contatos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 500, description: 'Falha ao criar alerta ou enviar mensagem.' })
  @ApiBody({ type: CreateAlertDto, description: 'Dados para criação do alerta, incluindo coordenadas geográficas (opcional)' }) // Use o DTO aqui
  create(@Request() req, @Body() dto: Pick<CreateAlertDto, 'lat' | 'lon'>) { // Use Pick para tipar apenas os campos do corpo
    return this.svc.create(req.user.userId, dto.lat, dto.lon);
  }

  @Get('testar-fila')
  @ApiOperation({ summary: 'Dispara um teste de carga para a fila de alertas (APENAS PARA DESENVOLVIMENTO)' })
  testarFila(@Request() req) {
    // Pega o ID do usuário autenticado para o teste
    const userId = req.user.userId; 
    const quantidadeDeAlertas = 10;
    return this.svc.testarFila(quantidadeDeAlertas, userId);
  }
}