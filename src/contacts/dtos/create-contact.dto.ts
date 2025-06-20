import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({
    description: 'Nome do contato',
    example: 'Maria Amiga',
  })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @ApiProperty({
    description: 'Número de telefone do contato (com DDD)',
    example: '5511912345678',
  })
  @IsString({ message: 'O telefone deve ser uma string.' })
  @IsNotEmpty({ message: 'O telefone não pode estar vazio.' })
  phone: string;
}