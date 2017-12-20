const Koa = require('koa');
const Router = require('koa-router');
const requireTree = require('require-tree');
const mount = require('koa-mounting');
const staticServe = require('koa-static-serve');

const config = require('./config');
const controllers = requireTree('./controllers');
const middlewares = requireTree('./middlewares');
const tplParse = middlewares.template.parse;
const app = new Koa();
router = new Router();


router.get('/ping', (ctx) => ctx.body = 'pong');
router.get('/', tplParse('home'), controllers.home);

const varnishCtrl = controllers['varnish-generator'];
router.get('/varnish-generator', tplParse('varnish-generator'), varnishCtrl.view);
router.post('/varnish-generator', varnishCtrl.generate);

const tinyCtrl = controllers['tiny-web'];
router.get('/tiny-web', tplParse('tiny-web'), tinyCtrl.view);
router.get('/tiny-web/analyze', tinyCtrl.analyze);

const staticOptions = config.staticOptions;
// static file
app.use(mount(
  staticOptions.urlPrefix,
  staticServe(staticOptions.path, {
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
