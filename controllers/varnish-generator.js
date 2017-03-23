const _ = require('lodash');
const bluebird = require('bluebird');
const varnishGenerator = require('varnish-generator');
const yaml = require('js-yaml');
const fs = bluebird.promisifyAll(require("fs"))
const path = require('path');

exports.view = (ctx) => {
  const file = path.join(__dirname, '../assets/varnish.yml');
  return fs.readFileAsync(file, 'utf8').then((varnishConfig) => {
    _.extend(ctx.state, {
      title: 'varnish generator',
      viewData: {
        globals: {
          varnishConfig,
        },
      },
    });
  });
};

exports.generate = (ctx) => {
  const data = ctx.request.body.config;
  let config;
  if (data[0] === '{') {
    config = JSON.parse(data);
  } else {
    config = yaml.safeLoad(data);
  }
  return varnishGenerator.getVcl(config).then((vcl) => {
    ctx.body = {
      vcl,
    };
  });
};
