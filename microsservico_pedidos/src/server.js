import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// ROTA DE TESTE - ACESSE http://localhost:3004/ PARA VER SE ESTÁ VIVO
fastify.get('/', async () => {
  return { msg: 'MS Pedidos rodando na porta 3004 🚀' };
});

// LISTAR POR USUÁRIO (A PUXADA QUE VOCÊ PEDIU)
fastify.get('/pedidos/usuario/:idUsuario', async (req, reply) => {
  const { idUsuario } = req.params;
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { userId: Number(idUsuario) },
      include: { itens: true }
    });
    return pedidos.length > 0 ? pedidos : reply.code(404).send({ msg: "Sem pedidos" });
  } catch (err) {
    return reply.code(500).send({ error: err.message });
  }
});

// CRIAR PEDIDO (CORRIGIDO: PRECO E USERID)
fastify.post('/pedidos', async (req, reply) => {
  const { userId, total, itens } = req.body;
  try {
    const pedido = await prisma.pedido.create({
      data: {
        userId: Number(userId),
        total: parseFloat(total),
        status: "CRIADO",
        itens: {
          create: itens.map(item => ({
            produtoId: Number(item.produtoId),
            quantidade: Number(item.quantidade),
            preco: parseFloat(item.precoUnitario || item.preco) // RESOLVE O ERRO 'PRECO IS MISSING'
          }))
        }
      },
      include: { itens: true }
    });

    // INTEGRAÇÃO COM PAGAMENTOS (PORTA 3003)
    try {
      await axios.post('http://localhost:3003/pagamentos', { orderId: pedido.id, valor: pedido.total });
    } catch (e) { console.log("Aviso: MS Pagamentos Offline"); }

    return reply.code(201).send(pedido);
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
});

// INICIALIZAÇÃO NA PORTA CORRETA (3004)
const start = async () => {
  try {
    await fastify.listen({ port: 3004, host: '0.0.0.0' });
    console.log('✅ Microsserviço de PEDIDOS ativo em: http://localhost:3004');
  } catch (err) {
    process.exit(1);
  }
};
start();