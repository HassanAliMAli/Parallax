import './db';
import Fastify from 'fastify';

import statusRoutes from './server/routes/status';
import jobsRoutes from './server/routes/jobs';

const server = Fastify({
  logger: true
});

// Register routes
server.register(statusRoutes);
server.register(jobsRoutes);

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
