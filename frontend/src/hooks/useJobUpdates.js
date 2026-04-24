import { useEffect } from 'react';
import { toast } from 'sonner';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Lắng nghe event `job:update` emit từ backend qua room serverId.
 * @param {(job: { jobId: string, status: 'completed'|'failed', resultMeta?: any, error?: string }) => void} onUpdate
 */
export default function useJobUpdates(onUpdate) {
  const { socket } = useSocket();
  const { selectedServerId } = useAuth();

  useEffect(() => {
    if (!socket || !selectedServerId) return undefined;
    socket.emit('join_server', selectedServerId);

    const handler = (job) => {
      if (typeof onUpdate === 'function') onUpdate(job);
      if (job?.status === 'failed') toast.error(`Job ${job.jobId} failed: ${job.error || 'unknown error'}`);
      if (job?.status === 'completed') toast.success(`Job ${job.jobId} completed`);
    };

    socket.on('job:update', handler);
    return () => socket.off('job:update', handler);
  }, [socket, selectedServerId, onUpdate]);
}
