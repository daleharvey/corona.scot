'use strict';

const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const Koa = require('koa');

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(serve(__dirname + '/www/'));
app.use(router.routes());

app.listen(process.env.PORT || 3000);
