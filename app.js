const express = require('express');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

const SECRET = "segredo_super";

const produtos = [
  { id: 1, nome: "Hambúrguer", preco: 25.0, estoque: 10 },
  { id: 2, nome: "Batata Frita", preco: 15.0, estoque: 5 }
];

let pedidos = [];

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: cliente@email.com
 *             senha: 123456
 *     responses:
 *       200:
 *         description: Sucesso
 */
app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;

  const usuario = {
    id: 1,
    nome: "João",
    email: "cliente@email.com",
    senha: "123456"
  };

  if (email !== usuario.email || senha !== usuario.senha) {
    return res.status(401).json({
      error: "CREDENCIAIS_INVALIDAS"
    });
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    SECRET,
    { expiresIn: '1h' }
  );

  return res.json({
    accessToken: token,
    user: {
      id: usuario.id,
      nome: usuario.nome
    }
  });
});

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      error: "TOKEN_NAO_INFORMADO"
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: "TOKEN_INVALIDO"
      });
    }

    req.user = user;
    next();
  });
}

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Criar pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             itens:
 *               - produtoId: 1
 *                 quantidade: 2
 *     responses:
 *       200:
 *         description: Sucesso
 */
app.post('/pedidos', autenticarToken, (req, res) => {
  const { itens } = req.body;

  if (!itens || itens.length === 0) {
    return res.status(400).json({
      error: "ITENS_OBRIGATORIOS"
    });
  }

  let total = 0;

  for (let item of itens) {
    const produto = produtos.find(p => p.id === item.produtoId);

    if (!produto) {
      return res.status(400).json({
        error: "PRODUTO_NAO_ENCONTRADO"
      });
    }

    if (produto.estoque < item.quantidade) {
      return res.status(409).json({
        error: "ESTOQUE_INSUFICIENTE"
      });
    }
  }

  for (let item of itens) {
    const produto = produtos.find(p => p.id === item.produtoId);
    total += produto.preco * item.quantidade;
    produto.estoque -= item.quantidade;
  }

  const pedido = {
    id: pedidos.length + 1,
    usuarioId: req.user.id,
    itens,
    total,
    status: "AGUARDANDO_PAGAMENTO"
  };

  pedidos.push(pedido);

  return res.status(201).json(pedido);
});

app.get('/pedidos', autenticarToken, (req, res) => {
  return res.json(pedidos);
});

/**
 * @swagger
 * /pagamentos/mock:
 *   post:
 *     summary: Pagamento mock
 *     tags: [Pagamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             pedidoId: 1
 *     responses:
 *       200:
 *         description: Resultado
 */
app.post('/pagamentos/mock', autenticarToken, (req, res) => {
  const { pedidoId } = req.body;

  const pedido = pedidos.find(p => p.id === pedidoId);

  if (!pedido) {
    return res.status(404).json({
      error: "PEDIDO_NAO_ENCONTRADO"
    });
  }

  const aprovado = Math.random() < 0.7;

  if (aprovado) {
    pedido.status = "PAGO";
    return res.status(200).json({
      status: "APROVADO",
      pedido
    });
  } else {
    pedido.status = "CANCELADO";
    return res.status(200).json({
      status: "RECUSADO",
      pedido
    });
  }
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Pedidos',
      version: '1.0.0',
      description: 'Documentação da API'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});