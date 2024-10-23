import http from 'http';
import app from './app';
import { normalizePort, onError } from './util/serverHandle';

const port = normalizePort((process.env.PORT || '8888'));
app.set('port', port);

// Create HTTP server. 将express应用作为请求处理函数
const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', () => {
  // 获取服务器的地址信息
  const addr = server.address();
  if (!addr) {
    return;
  }
  console.log(`Server is listening on port localhost:${port}, you can view the mock data by accessing localhost:${port}/api/user.`);
});

