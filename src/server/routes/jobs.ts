import { FastifyInstance } from 'fastify';
import { memoryQueue } from '../../queue';

export default async function (fastify: FastifyInstance) {
  fastify.post('/v1/jobs', async (request, reply) => {
    const { prompt } = request.body as { prompt: string };
    if (!prompt) {
      return reply.code(400).send({ error: 'Prompt is required' });
    }
    const job = await memoryQueue.add(prompt);
    return reply.code(201).send(job);
  });

  fastify.get('/v1/jobs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = await memoryQueue.getJob(id);
    if (job) {
      return job;
    } else {
      return reply.code(404).send({ error: 'Job not found' });
    }
  });
}
