import * as pedidoController from '../controllers/pedidoController.js';

export async function pedidoRoutes(fastify) {
  // CRUD PADRÃO
  fastify.post('/pedidos', pedidoController.criar);           // Create
  fastify.get('/pedidos', pedidoController.listarTodos);      // Read All
  fastify.get('/pedidos/:id', pedidoController.buscarPorId);  // Read One
  fastify.patch('/pedidos/:id/status', pedidoController.atualizarStatus); // Update
  fastify.delete('/pedidos/:id', pedidoController.deletar);   // Delete

  // BUSCA ESPECÍFICA
  fastify.get('/pedidos/usuario/:idUsuario', pedidoController.listarPorUsuario);
}