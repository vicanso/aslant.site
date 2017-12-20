const path = require('path');

const pkg = require('./package');

const env = process.env.NODE_ENV || 'development';

exports.version = pkg.version;

exports.env = env;

exports.port = process.env.PORT || 5018;

// view root path
exports.viewPath = path.join(__dirname, 'views');

exports.staticOptions = {
  urlPrefix: '/static',
  path: path.join(__dirname, 'public'),
  maxAge: env === 'development' ? 0 : 365 * 24 * 3600,
  headers: {
    Vary: 'Accept-Encoding',
  },
  host: process.env.STATIC_HOST || '',
};

exports.grpc = 'aslant.site:3016';
