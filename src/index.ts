import './db';
import Fastify from 'fastify';

import statusRoutes from './server/routes/status';

const server = Fastify({
  logger: true
});

// Register routes
server.register(statusRoutes, { prefix: '/v1' });

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
