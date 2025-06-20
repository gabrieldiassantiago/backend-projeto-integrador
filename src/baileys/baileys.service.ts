import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

// tipagem da fila de mensagens pendentes
interface Fila {
  telefone: string;
  mensagem: string;
}

@Injectable()
export class WhatsAppService implements OnModuleInit {
    private readonly logger = new Logger(WhatsAppService.name);
    private client: Client | null = null;
    private tentativas = 0;
    private readonly MAX_TENTATIVAS = 5;
    private readonly TEMPO_BASE_RETRY = 5000; // 5 segundos
    private inicializando = false;

    // Propriedade para a fila de mensagens pendentes
    private fila_processar: Fila[] = [];

    async onModuleInit() {
        this.inicializarWhatsApp().catch((erro) => {
            this.logger.error(`Falha ao inicializar o WhatsApp no onModuleInit: ${erro.message}`);
        });
    }

    private async inicializarWhatsApp() {
        if (this.inicializando) {
            this.logger.warn('Inicialização do WhatsApp já está em andamento.');
            return;
        }
        this.inicializando = true;

        try {
            this.client = new Client({
                authStrategy: new LocalAuth({ dataPath: './auth' }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-gpu',
                    ],
                },
                webVersionCache: {
                    type: 'remote',
                    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
                },
            });

            this.client.on('qr', (qr) => {
                this.logger.log('QR Code gerado. Escaneie com seu app do WhatsApp:');
                qrcode.generate(qr, { small: true });
            });

            this.client.on('ready', () => {
                this.logger.log('Cliente WhatsApp conectado com sucesso!');
                this.tentativas = 0;
                this.inicializando = false;
                // Ao conectar, processa qualquer mensagem que esteja na fila
                this.processarFilas();
            });

            this.client.on('authenticated', () => {
                this.logger.log('Autenticação realizada com sucesso.');
            });

            this.client.on('auth_failure', (msg) => {
                this.logger.error(`Falha na autenticação: ${msg}`);
                this.inicializando = false;
                this.tentarReconectar();
            });

            this.client.on('disconnected', (motivo) => {
                this.logger.error(`Desconectado: ${motivo}`);
                this.client?.destroy();
                this.client = null;
                this.inicializando = false;
                this.tentarReconectar();
            });

            this.client.on('error', (erro) => {
                this.logger.error(`Erro no cliente: ${erro.message}`);
            });

            this.logger.log('Iniciando inicialização do cliente WhatsApp...');
            await this.client.initialize();
        } catch (erro) {
            this.logger.error(`Erro ao inicializar o cliente WhatsApp: ${erro.message}`);
            this.inicializando = false;
            this.tentarReconectar();
        }
    }

    private async tentarReconectar() {
        if (this.tentativas < this.MAX_TENTATIVAS) {
            const delay = Math.pow(2, this.tentativas) * this.TEMPO_BASE_RETRY;
            this.logger.log(`Tentando reconectar em ${delay / 1000} segundos... (Tentativa ${this.tentativas + 1}/${this.MAX_TENTATIVAS})`);
            this.tentativas++;
            setTimeout(() => this.inicializarWhatsApp(), delay);
        } else {
            this.logger.error('Número máximo de tentativas de reconexão atingido. Verifique sua configuração.');
        }
    }

    /**
     * Tenta enviar uma mensagem. Se o cliente estiver offline ou ocorrer um erro,
     * a mensagem é adicionada a uma fila para ser enviada posteriormente.
     */


    async enviarTexto(telefone: string, mensagem: string) {
        if (this.client && this.client.info) {
            try {
                const telefoneFormatado = telefone.includes('@s.whatsapp.net') ? telefone : `${telefone}@s.whatsapp.net`;
                await this.client.sendMessage(telefoneFormatado, mensagem);
                this.logger.log(`Mensagem enviada diretamente para ${telefone}`);
            } catch (erro) {
                this.logger.error(`Falha ao enviar mensagem para ${telefone}, adicionando à fila. Erro: ${erro.message}`);
                this.fila_processar.push({ telefone, mensagem });
            }
        } else {
            this.logger.log(`Cliente desconectado. Mensagem para ${telefone} adicionada à fila.`);
            this.fila_processar.push({ telefone, mensagem });
        }
    }


    private async processarFilas() {
        if (this.fila_processar.length === 0) {
            return;
        }

        this.logger.log(`Processando ${this.fila_processar.length} mensagens pendentes...`);

        const mensagensParaProcessar = [...this.fila_processar];
        this.fila_processar = [];

        const promessas = mensagensParaProcessar.map(async (message) => {
            const telefoneFormatado = message.telefone.includes('@s.whatsapp.net')
                ? message.telefone
                : `${message.telefone}@s.whatsapp.net`;
            return this.client!.sendMessage(telefoneFormatado, message.mensagem);
        });

        const resultados = await Promise.allSettled(promessas);

        resultados.forEach((resultado, index) => {
            if (resultado.status === 'rejected') {
                this.logger.error(`Falha ao processar mensagem da fila para ${mensagensParaProcessar[index].telefone}. Será tentado novamente.`);
                this.fila_processar.push(mensagensParaProcessar[index]);
            }
        });

        if (this.fila_processar.length === 0) {
            this.logger.log('Fila de mensagens processada com sucesso.');
        }
    }

    async obterStatus(): Promise<string> {
        if (!this.client || !this.client.info) {
            return `Cliente WhatsApp não está conectado. Mensagens na fila: ${this.fila_processar.length}`;
        }
        return `Cliente WhatsApp está conectado. Mensagens na fila: ${this.fila_processar.length}`;
    }
}