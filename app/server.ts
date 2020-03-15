import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import formRoutes from './routes/form-routes';

const SqLiteStore = require('connect-sqlite3')(session);

const app = express();
const port = process.env.PORT || 7272;
const isDevelopmentEnv = process.env.NODE_ENV === 'dev';

app.use(
  session({
    store: new SqLiteStore(),
    secret: 'TODO maybe add secret here',
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
    },
    proxy: true
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'views', 'errors')
]);

app.use(formRoutes);

app.use(
  '/static',
  express.static('static', {
    ...(!isDevelopmentEnv && {
      setHeaders(res) {
        res.set(
          'Cache-Control',
          'max-age=86400, no-cache="Set-Cookie", public'
        );
      }
    })
  })
);

// Fallback error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

app.listen(port);

console.log(`API up and running on port ${port}`);
