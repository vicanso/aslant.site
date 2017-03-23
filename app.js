const Koa = require('koa');
const Router = require('koa-router');
const requireTree = require('require-tree');
const mount = require('koa-mounting');
const staticServe = require('koa-static-serve');

const config = require('./config');
const controllers = requireTree('./controllers');
const middlewares = requireTree('./middlewares');
const app = new Koa();
router = new Router();

router.get('/ping', (ctx) => ctx.body = 'pong');
router.get('/', middlewares.template.parse('home'), controllers.home);
router.get('/varnish-generator', middlewares.template.parse('varnish-generator'), controllers['varnish-generator'].view);
router.post('/varnish-generator', controllers['varnish-generator'].generate);

const staticOptions = config.staticOptions;
const denyQuerystring = config.env !== 'development';
// static file
app.use(mount(
  staticOptions.urlPrefix,
  staticServe(staticOptions.path, {
    denyQuerystring,
    maxAge: staticOptions.maxAge,
    headers: staticOptions.headers,
  })));
app.use(require('koa-bodyparser')());
app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(config.port, (err) => {
  /* istanbul ignore if */
  if (err) {
    console.error(`server listen on http://127.0.0.1:${config.port}/ fail, err:${err.message}`);
  } else {
    console.info(`server listen on http://127.0.0.1:${config.port}/`);
  }
});
