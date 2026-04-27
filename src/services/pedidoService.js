import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export const createPedido = async (data, token) => {
  const { userId, total, itens } = data;

  // 1. REGRA 1: Valida o usuário no microsserviço de Usuários do colega
  try {
    // Substitua pelo IP real da máquina dele se não for localhost
    const urlUsuarios = `http://localhost:3000/usuarios/${userId}`;
    
    await axios.get(urlUsuarios, {
      headers: { Authorization: token } 
    });
  } catch (error) {
    // Se o MS de Usuários retornar erro (401 ou 404), o pedido é cancelado aqui
    throw new Error("Usuário não autorizado ou inexistente no sistema de Usuários.");
  }

  // 2. Cria o pedido no seu banco SQLite local
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

  // 3. REGRA 1: Integração com Pagamentos (Porta 3003)
  try {
    await axios.post('http://localhost:3003/pagamentos', { 
      orderId: novoPedido.id, 
      valor: novoPedido.total 
    });
    console.log(`Pedido ${novoPedido.id} enviado para pagamento.`);
  } catch (error) {
    console.error("Aviso: Microsserviço de Pagamentos offline.");
  }

  return novoPedido;
};

// Funções padrão do CRUD
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
  await prisma.pedidoItem.deleteMany({ where: { pedidoId: Number(id) } });
  return await prisma.pedido.delete({ where: { id: Number(id) } });
};