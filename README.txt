API de Pedidos

A aplicação permite realizar autenticação de usuário, criação de pedidos, validação de estoque e simulação de pagamento.

Tecnologias utilizadas

* Node.js
* Express
* JSON Web Token (JWT)
* Swagger (documentação da API)

Como executar o projeto

1. Instalar as dependências:
npm install

2. Iniciar o servidor:
node app.js

3. Acessar a API:
http://localhost:3000

4. Acessar a documentação:
http://localhost:3000/docs

Fluxo básico de uso

1. Realizar login para obter o token
2. Utilizar o token nas requisições protegidas
3. Criar um pedido
4. Realizar o pagamento do pedido

Exemplo de uso

1. Login:

POST /auth/login

Body:
{
  "email": "cliente@email.com",
  "senha": "123456"
}

Resposta: retorna um accessToken

2. Criar pedido:

POST /pedidos

Header:
Authorization: Bearer TOKEN

Body:
{
  "itens": [
    { "produtoId": 1, "quantidade": 2 }
  ]
}

3. Pagamento:

POST /pagamentos/mock

Body:
{
  "pedidoId": 1
}

Funcionalidades implementadas

* Autenticação com geração de token JWT
* Proteção de rotas com middleware
* Criação de pedidos
* Validação de estoque
* Cálculo automático do valor total
* Simulação de pagamento (mock)
* Atualização de status do pedido

Observações

* O token deve ser enviado no header das requisições protegidas
* O pagamento é simulado e pode ser aprovado ou recusado

Autor

Nome: Matheus Caetano Almeida Lima 
RU: 4675007
Projeto desenvolvido para fins acadêmicos.
Testes realizados utilizando Postman.