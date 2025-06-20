import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAlertDto {
  // A propriedade userId geralmente é extraída do token JWT no guarda,
  // mas incluí para clareza na documentação do corpo esperado, embora
  // no código do controller ela não seja esperada no corpo da requisição diretamente.
  // Você pode omiti-la aqui se sempre for extraída do token.
  @ApiProperty({
    description: 'ID do usuário para o qual o alerta está sendo criado.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    readOnly: true, // Indica que este campo é apenas para leitura e não deve ser fornecido na requisição
  })
  @IsUUID()
  @IsOptional() // Opcional no corpo, pois virá do token
  userId?: string;

  @ApiProperty({
    description: 'Latitude do local da queda (opcional)',
    example: -23.55052,
    required: false,
  })
  @IsNumber({}, { message: 'A latitude deve ser um número.' })
  @IsOptional()
  lat?: number;

  @ApiProperty({
    description: 'Longitude do local da queda (opcional)',
    example: -46.633308,
    required: false,
  })
  @IsNumber({}, { message: 'A longitude deve ser um número.' })
  @IsOptional()
  lon?: number;
}