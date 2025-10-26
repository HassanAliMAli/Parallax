import { FastifyInstance } from 'fastify';

export default async function (server: FastifyInstance) {
  server.get('/status', async (request, reply) => {
    // Mock data for now
    const status = {
      worker_running: false,
      queued_jobs: 0,
      uptime_seconds: Math.floor(process.uptime()),
      db_status: 'connected'
    };
    reply.code(200).send(status);
  });
}
