const fastify = require('fastify')({ logger: true })
const { PrismaClient } = require('@prisma/client')
const axios = require('axios')

const prisma = new PrismaClient()

// ==============================
// TESTE
// ==============================
fastify.get('/', async () => {
  return { msg: 'API de pedidos rodando 🚀' }
})

// ==============================
// GET - LISTAR TODOS
// ==============================
fastify.get('/pedidos', async () => {
  return prisma.pedido.findMany({
    include: { itens: true }
  })
})

// ==============================
// GET BY STATUS
// ==============================
fastify.get('/pedidos/status/:status', async (req) => {
  const { status } = req.params

  return prisma.pedido.findMany({
    where: { status }
  })
})

// ==============================
// GET BY STATUS + USER
// ==============================
fastify.get('/pedidos/user/:userId/status/:status', async (req) => {
  const { userId, status } = req.params

  return prisma.pedido.findMany({
    where: {
      userId: Number(userId),
      status
    }
  })
})

// ==============================
// TRACKING (status do pedido)
// ==============================
fastify.get('/pedidos/:id/tracking', async (req, reply) => {
  const { id } = req.params

  const pedido = await prisma.pedido.findUnique({
    where: { id: Number(id) }
  })

  if (!pedido) {
    return reply.code(404).send({ error: 'Pedido não encontrado' })
  }

  return {
    pedidoId: pedido.id,
    status: pedido.status
  }
})


fastify.post('/pedidos', async (req, reply) => {
  const { userId, total } = req.body

  const pedido = await prisma.pedido.create({
    data: {
      userId,
      total,
      status: "CRIADO"
    }
  })

  // integração com pagamento
  try {
    await axios.post('http://localhost:3003/pagamentos', {
      orderId: pedido.id,
      valor: pedido.total
    })
  } catch (error) {
    console.error("Erro ao enviar para pagamento:", error.message)
  }

  return pedido
})

fastify.put('/pedidos/:id/status', async (req, reply) => {
  const { id } = req.params
  const { status } = req.body

  return prisma.pedido.update({
    where: { id: Number(id) },
    data: { status }
  })
})


fastify.put('/pedidos/:id/cancel', async (req, reply) => {
  const { id } = req.params

  return prisma.pedido.update({
    where: { id: Number(id) },
    data: { status: "CANCELADO" }
  })
})

fastify.patch('/pedidos/:id/status', async (req) => {
  const { id } = req.params
  const { status } = req.body

  return prisma.pedido.update({
    where: { id: Number(id) },
    data: { status }
  })
})


// GET endereço
fastify.get('/enderecos/:userId', async (req) => {
  const { userId } = req.params

  return prisma.endereco.findMany({
    where: { userId: Number(userId) }
  })
})

// POST endereço
fastify.post('/enderecos', async (req) => {
  return prisma.endereco.create({
    data: req.body
  })
})

// PUT endereço
fastify.put('/enderecos/:id', async (req) => {
  const { id } = req.params

  return prisma.endereco.update({
    where: { id: Number(id) },
    data: req.body
  })
})

// DELETE endereço
fastify.delete('/enderecos/:id', async (req) => {
  const { id } = req.params

  return prisma.endereco.delete({
    where: { id: Number(id) }
  })
})

fastify.listen({ port: 3004 }, () => {
  console.log('Servidor rodando na porta 3004 🚀')
})