import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}


  //funcao pra criar um contato  <vale lembrar que o userId é o id do usuario que esta logado recebido pelo token e que esta sendo passado pelo token>
  async create(userId: string, data: { name: string; phone: string }) {
    return this.prisma.contact.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId },
    });
  }

  async update(id: string, data: { name?: string; phone?: string }) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
