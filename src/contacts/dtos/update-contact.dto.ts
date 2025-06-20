import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateContactDto {
  @ApiProperty({
    description: 'Novo nome do contato (opcional)',
    example: 'Maria Nova',
    required: false,
  })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Novo número de telefone do contato (opcional, com DDD)',
    example: '5511998765432',
    required: false,
  })
  @IsString({ message: 'O telefone deve ser uma string.' })
  @IsOptional()
  phone?: string;
}