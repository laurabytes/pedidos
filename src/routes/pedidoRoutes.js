import * as pedidoController from '../controllers/pedidoController.js';

export async function pedidoRoutes(fastify) {
  fastify.post('/pedidos', pedidoController.criar);
  fastify.get('/pedidos', pedidoController.listarTodos);
  fastify.get('/pedidos/:id', pedidoController.buscarPorId);
  fastify.get('/pedidos/usuario/:idUsuario', pedidoController.listarPorUsuario);
  fastify.patch('/pedidos/:id/status', pedidoController.atualizarStatus);
  fastify.delete('/pedidos/:id', pedidoController.deletar);
}