import http from 'http';
import { pathToFileURL } from 'url';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';

const config = loadEnv();
const app = createApp(config);
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('pingServer', () => socket.emit('pongServer', { message: 'pong' }));
});

export const startServer = () => new Promise((resolve) => {
  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    resolve(server);
  });
});

const isMainModule = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  startServer();
}

export { app, server };
export default app;
