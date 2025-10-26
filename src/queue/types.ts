export interface Job {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Queue {
  add: (prompt: string) => Promise<Job>;
  getNext: () => Promise<Job | null>;
  updateStatus: (id: string, status: Job['status']) => Promise<void>;
  getJob: (id: string) => Promise<Job | null>;
}
