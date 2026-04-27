import * as pedidoService from '../service/pedidoService.js';

export const criar = async (req, reply) => {
  try {
    const pedido = await pedidoService.createPedido(req.body);
    return reply.code(201).send(pedido);
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
};

export const listarTodos = async () => {
  return await pedidoService.getAllPedidos();
};

export const buscarPorId = async (req, reply) => {
  const pedido = await pedidoService.getPedidoById(req.params.id);
  if (!pedido) return reply.code(404).send({ msg: "Pedido não encontrado" });
  return pedido;
};

export const listarPorUsuario = async (req, reply) => {
  const pedidos = await pedidoService.getPedidosByUser(req.params.idUsuario);
  return pedidos;
};

export const atualizarStatus = async (req) => {
  return await pedidoService.updateStatus(req.params.id, req.body.status);
};

export const deletar = async (req, reply) => {
  try {
    await pedidoService.deletePedido(req.params.id);
    return { msg: "Pedido deletado com sucesso" };
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
};