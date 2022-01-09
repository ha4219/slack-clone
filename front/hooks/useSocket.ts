import { useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

const backURL = 'http://localhost:3095';

const sockets: {[key: string]: Socket } = {};

const useSocket = (workspace?: string): [Socket | undefined, () => void] => {

  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);

  if (!workspace) {
    return [undefined, disconnect];
  }
  
  if (!sockets[workspace]) {
    sockets[workspace] = io(`${backURL}/ws-${workspace}`, {
      transports: ['websocket'],
    });
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;