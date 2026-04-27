import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export const createPedido = async (data) => {
  const { userId, total, itens } = data;

  // Cria o pedido e os itens vinculados
  const novoPedido = await prisma.pedido.create({
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

  // INTEGRAÇÃO: Envia o orderId para o MS de Pagamentos (Porta 3003)
  try {
    await axios.post('http://localhost:3003/pagamentos', { 
      orderId: novoPedido.id, 
      valor: novoPedido.total 
    });
    console.log(`Integração: Pedido ${novoPedido.id} enviado para pagamentos.`);
  } catch (error) {
    console.error("Erro na integração de pagamentos:", error.message);
  }

  return novoPedido;
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
  // Deleta itens primeiro devido à restrição de chave estrangeira
  await prisma.pedidoItem.deleteMany({ where: { pedidoId: Number(id) } });
  return await prisma.pedido.delete({ where: { id: Number(id) } });
};