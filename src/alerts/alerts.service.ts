import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { WhatsAppService } from 'src/baileys/baileys.service';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private readonly opencageApiKey: string;
  private readonly opencageBaseUrl = 'https://api.opencagedata.com/geocode/v1/json';

  constructor(
    private prisma: PrismaService,
    private wa: WhatsAppService,
    private configService: ConfigService,
  ) {
    
    const apiKey ='c4c6e2ed49fa4a13a2445e0f49a327b0' //chave de api (nao perder e nao vazar)

    if (!apiKey) {
    this.logger.error("A API nao foi defnida");
    throw new Error("A API nao foi defnida");
    }
    this.opencageApiKey = apiKey;
  }


  //essa funcao precisa ser refatorada pois ela esta demorando muito pra executar <retornar os dados na veradde>

  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const response = await axios.get(this.opencageBaseUrl, {
        params: {
          q: `${lat},${lon}`,
          key: this.opencageApiKey,
          language: 'pt', 
          no_annotations: 1, 
          pretty: 1, 
          confidence: 25 //ainda nao sei porque esse parametro nao ta indo
        },
        headers: {
          'User-Agent': 'SeuApp/1.0 (seu@email.com)', //nao e tao necessario isso <eu acho>
        },
      });

      // Verifica se a resposta contém resultados SE NAO TIVVER TRATA O ERRO e tenta de novo

      if (!response.data.results || response.data.results.length === 0) {
        this.logger.warn('nao foi possivel encontrar o endereço');
        return 'Endereço não encontrado';
      }

      if (response.data.results.length === 0) {
        this.logger.warn('Nenhum resultado de geocodificação encontrado');
        return 'Endereço não encontrado';
      }

      return response.data.results[0].formatted || 'Endereço não encontrado';
    } catch (error) {
      this.logger.error(`erro na api: ${error.message}`, error.stack);
      return 'Endereço desconhecido';
    }
  }


  async testarFila(quantidade: number, userId: string) {
    this.logger.log(`Iniciando teste de fila com ${quantidade} mensagens para o usuário ${userId}`);

    const latDeTeste = -23.55052; // Exemplo de latitude
    const lonDeTeste = -46.63331; // Exemplo de longitude

    for (let i = 0; i < quantidade; i++) {
       this.logger.log(`Criando alerta de teste #${i + 1}`);
      // Chamamos o método create, mas não precisamos esperar a conclusão (await)
      // para que o teste dispare rapidamente.
      this.create(userId, latDeTeste, lonDeTeste);
    } return { message: 'Teste de fila iniciado com sucesso' };
  }

  async create(userId: string, lat?: number, lon?: number) {
    let location = 'indefinido';
    let mapsLink = '';

    try { 
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            this.logger.error(`Usuário com ID ${userId} não encontrado.`);
            throw new InternalServerErrorException('Usuário do alerta não encontrado.');
        }

        if (lat !== undefined && lon !== undefined) {
            if (
                !Number.isFinite(lat) || !Number.isFinite(lon) ||
                lat < -90 || lat > 90 || lon < -180 || lon > 180
            ) {
                this.logger.warn(`Coordenadas inválidas: lat=${lat}, lon=${lon}`);
                throw new Error('Coordenadas inválidas');
            }
            location = await this.reverseGeocode(lat, lon);
            mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`; 
        }

        const alert = await this.prisma.alert.create({
            data: { userId, location },
        });

        const contacts = await this.prisma.contact.findMany({ where: { userId } });
        if (!contacts.length) {
            this.logger.warn(`No contacts found for user ${userId}`);
            throw new Error(`Nenhum contato cadastrado para ${userId}`);
        }

        // 3. Usando user.name, como você já fez corretamente
        const text =
            `🚨 *Queda detectada!*\n\n` +
            `👤 Paciente: ${user.name}\n` + // Perfeito!
            `📍 Local: ${location}\n` +
            (mapsLink ? `🗺️ Mapa: ${mapsLink}\n` : '') +
            `🕒 Hora: ${new Date(alert.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

        await Promise.all(
            contacts.map(c =>
                this.wa.enviarTexto(c.phone.replace(/\D/g, ''), text),
            ),
        );

        return alert;
    } catch (error) {
        this.logger.error(`Error creating alert: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Falha ao criar alerta');
    }
}
}