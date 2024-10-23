import path from 'path';
import fs from 'fs';
import type { Express } from 'express';

interface ModuleExports {
  [key: string]: any;
}

const mockDataDir = path.join(__dirname, 'mock-data');

function readTsFiles(dirPath: string): ModuleExports {
  const files = fs.readdirSync(dirPath).map(file => path.join(dirPath, file));
  const stats = files.map(file => fs.statSync(file));
  const result = stats.reduce((acc: ModuleExports, stat, index) => {
    const fullPath = files[index];
    if (stat.isDirectory()) {
      // 递归读取子目录
      const subModules = readTsFiles(fullPath);
      Object.keys(subModules).forEach(moduleName => {
        acc[path.join(path.relative(mockDataDir, path.dirname(fullPath)), moduleName)] = subModules[moduleName];
      });
    } else if (stat.isFile() && path.extname(fullPath) === '.ts' && path.basename(fullPath) === 'index.ts') {
      const moduleExports = require(fullPath);
      if (moduleExports) {
        const moduleName = path.relative(mockDataDir, path.dirname(fullPath));
        acc[moduleName] = moduleExports.default;
      }
    }
    return acc;
  }, {});

  return result;
}

const combineMockRequest = Object.entries(readTsFiles(mockDataDir)).reduce((pre, [k, v]) => {
  return {...pre, ...v}
}, {} as ModuleExports);

const entries = Object.entries(combineMockRequest);

export default function appRoutes(app: Express) {
  entries.forEach(([key, caller]:any) => {
    const [url, method = 'get'] = key.split('@');
    const m = method as 'get' | 'post' | 'put' | 'delete';
    app[m](url, (req, res) => {
      const { query, body } = req;
      if (typeof caller === 'object') {
        res.json(caller ?? null);
        return;
      }
      const result = caller(query, body);
      if (result && typeof result.then === 'function') {
        result.then(
          (d: any) => {
            res.json(d ?? null);
          },
          (e: any) => {
            res.status(500).json(e);
          },
        );
        return;
      }
      res.json(result ?? null);
    });
  });
}
