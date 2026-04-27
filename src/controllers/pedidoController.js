import * as pedidoService from '../service/pedidoService.js';

export const criar = async (req, reply) => {
  try {
    // Captura o Token do Postman (necessário para validar com o MS de Usuários)
    const token = req.headers['authorization'];
    
    if (!token) {
      return reply.code(401).send({ error: "Token de autenticação não fornecido." });
    }

    const pedido = await pedidoService.createPedido(req.body, token);
    return reply.code(201).send(pedido);
  } catch (error) {
    return reply.code(401).send({ error: error.message });
  }
};

export const listarTodos = async (req, reply) => {
  const pedidos = await pedidoService.getAllPedidos();
  return pedidos;
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

export const atualizarStatus = async (req, reply) => {
  try {
    const { status } = req.body;
    const pedido = await pedidoService.updateStatus(req.params.id, status);
    return pedido;
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
};

export const deletar = async (req, reply) => {
  try {
    await pedidoService.deletePedido(req.params.id);
    return { msg: "Pedido deletado com sucesso" };
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
};