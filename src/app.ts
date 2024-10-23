import  express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import createError from 'http-errors';
import type { NextFunction, Request, Response } from 'express';
import  appRoutes  from './routes';
import morgan from 'morgan';

declare global {
    var mock: {
      user: { userType?: 'FIRST_USE' | 'LOCKED_HAND' };
    };
  }
  
global.mock = {
    user: {},
};

const publicPath = path.join(path.join(__dirname, '..'), 'public');
const app = express();

app.use(session({
    secret: 'express-mock',
    // 如果后端没有保证session始终最新，设为true，保证每次都用最新的session，
    // 相反，设为false，不用每次保存，可以提高性能
    resave: true,
    // 当 saveUninitialized 设置为 false 时，只有在 session 被修改后，才会将其保存到 session 存储中。
    //这意味着如果用户只做了诸如浏览页面而没有进行登录或其他修改 session 的操作，那么他们的 session 不会被保存。这样做可以减少对存储系统的写入操作，但可能会导致 session 数据的丢失，比如在多个并行请求的情况下，或者在用户实际开始与应用交互之前 
    saveUninitialized: false,
    cookie: {
        //  3600 秒后过期
        maxAge: 3600 * 1000,
    }
}))

//1.日志记录----捕获每个进入应用的 HTTP 请求，并根据 【method path status time】格式将信息记录到控制台
app.use(morgan('dev')); 

//2.请求解析-----
//允许 Express 应用解析传入请求中的 JSON 格式的请求体
app.use(express.json());
// 允许 Express 应用解析传入请求中的 URL 编码的请求体（通常用于表单数据）
// 如果你的表单数据是 URL 编码格式（application/x-www-form-urlencoded），
// 那么这个中间件会解析请求体，并将表单字段和值添加到 req.body 对象中。
app.use(express.urlencoded({ extended: false }));
// 当客户端请求包含 Cookie 时，cookieParser 中间件会解析这些 Cookie，
// 并将它们作为属性添加到 req.cookies 对象中
app.use(cookieParser());

//3.静态文件----
app.use(express.static(publicPath));

//4.处理请求----
//禁用 HTTP 响应中的 ETag（实体标签）
// ETag 是 HTTP 协议中的一种机制，用于标识资源的特定版本。它的主要作用是帮助缓存管理和条件请求。
app.disable('etag');
// app.all() 方法来注册一个处理所有 HTTP 请求方法
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Content-Type', 'application/json;charset=utf-8');
    //将控制权传递给下一个中间件或路由处理函数
    next();
});

//5.处理路由----
appRoutes(app);

//6.处理error---
app.use((req, res, next) => {
    console.log(req, '==req');
    //所有请求都返回404
    next(createError(404));
});
// 系统报错兜底
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // res.locals 是一个用于在中间件之间共享数据的对象，存储在这里的数据可以在后续的中间件或视图中访问
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    //设置响应状态码。使用 err.status（如果存在）作为状态码，如果没有则默认使用 500（表示服务器内部错误）。
    //发送响应，内容为 'system error'，表示发生了系统错误。
    res.status(err.status || 500).send('system error');
});
  
export default app;