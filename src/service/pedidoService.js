import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export const createPedido = async (data) => {
  const { userId, total, itens } = data;
  return await prisma.pedido.create({
    data: {
      userId: Number(userId),
      total: parseFloat(total),
      status: "CRIADO",
      itens: {
        create: itens.map(item => ({
          produtoId: Number(item.produtoId),
          quantidade: Number(item.quantidade),
          preco: parseFloat(item.precoUnitario || item.preco)
        }))
      }
    },
    include: { itens: true }
  });
};

export const getAllPedidos = async () => {
  return await prisma.pedido.findMany({ include: { itens: true } });
};

export const getPedidoById = async (id) => {
  return await prisma.pedido.findUnique({
    where: { id: Number(id) },
    include: { itens: true }
  });
};

export const getPedidosByUser = async (idUsuario) => {
  return await prisma.pedido.findMany({
    where: { userId: Number(idUsuario) },
    include: { itens: true }
  });
};

export const updateStatus = async (id, status) => {
  return await prisma.pedido.update({
    where: { id: Number(id) },
    data: { status }
  });
};

export const deletePedido = async (id) => {
  // O SQLite exige deletar os itens primeiro ou configurar Cascade no Prisma
  await prisma.pedidoItem.deleteMany({ where: { pedidoId: Number(id) } });
  return await prisma.pedido.delete({ where: { id: Number(id) } });
};