export function normalizePort(val: string) {

    const port = parseInt(val, 10);
    if (Number.isNaN(Number(port))) {
      return val;
    }
  
    if (port >= 0) {
      return port;
    }
  
    return false;
  }

export function onError(port: number, error: any) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

