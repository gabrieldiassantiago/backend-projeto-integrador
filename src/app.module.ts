import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppService } from './baileys/baileys.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    AlertsModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService, WhatsAppService],
})
export class AppModule {}