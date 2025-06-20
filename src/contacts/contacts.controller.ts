import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

import { CreateContactDto } from './dtos/create-contact.dto'; // Importe o DTO
import { UpdateContactDto } from './dtos/update-contact.dto'; // Importe o DTO

@ApiBearerAuth('access-token')
@ApiTags('contatos')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo contato para o usuário autenticado' })
  @ApiResponse({ status: 201, description: 'O contato foi criado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiBody({ type: CreateContactDto, description: 'Dados do novo contato' }) // Use o DTO aqui
  create(@Request() req, @Body() createContactDto: CreateContactDto) { // Altere o tipo para o DTO
    return this.contactsService.create(req.user.userId, createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtém todos os contatos do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Retorna uma lista de contatos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll(@Request() req) {
    return this.contactsService.findAllByUser(req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um contato existente pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do contato a ser atualizado', type: String })
  @ApiResponse({ status: 200, description: 'O contato foi atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Contato não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiBody({ type: UpdateContactDto, description: 'Dados a serem atualizados no contato' }) // Use o DTO aqui
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) { // Altere o tipo para o DTO
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um contato pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do contato a ser removido', type: String })
  @ApiResponse({ status: 200, description: 'O contato foi removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Contato não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}