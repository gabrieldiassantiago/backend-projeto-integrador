import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from '../prisma.service';
import { WhatsAppService } from '../baileys/baileys.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false, 
      envFilePath: '.env', 
    }),
  ],
  controllers: [AlertsController],
  providers: [AlertsService, PrismaService, WhatsAppService],
  exports: [AlertsService], 
})
export class AlertsModule {}