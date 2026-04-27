import Fastify from 'fastify';
import { pedidoRoutes } from './routes/pedidoRoutes.js';

const fastify = Fastify({ logger: true });

fastify.register(pedidoRoutes);

fastify.get('/', async () => {
  return { msg: 'MS Pedidos Arquitetado rodando na 3004 🚀' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3004, host: '0.0.0.0' });
    console.log(' Servidor funcionando aq: http://localhost:3004');
  } catch (err) {
    process.exit(1);
  }
};
start();