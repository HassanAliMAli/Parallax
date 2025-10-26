import { Job, Queue } from './types';
import { randomUUID } from 'crypto';

const jobs: Job[] = [];

export const memoryQueue: Queue = {
  async add(prompt: string): Promise<Job> {
    const newJob: Job = {
      id: randomUUID(),
      prompt,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jobs.push(newJob);
    return newJob;
  },

  async getNext(): Promise<Job | null> {
    const job = jobs.find((j) => j.status === 'pending');
    if (job) {
      job.status = 'processing';
      job.updatedAt = new Date();
      return job;
    }
    return null;
  },

  async updateStatus(id: string, status: Job['status']): Promise<void> {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      job.status = status;
      job.updatedAt = new Date();
    }
  },

  async getJob(id: string): Promise<Job | null> {
    const job = jobs.find((j) => j.id === id);
    return job || null;
  },
};
