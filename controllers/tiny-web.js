const cheerio = require('cheerio');
const _ = require('lodash');
const urlJoin = require('url-join');
const path = require('path');
const url = require('url');
const Promise = require('bluebird');
const request = require('superagent');
const grpc = require('grpc');
const zlib = require('zlib');
const fs = require('fs');
const Stream = require('stream');

const config = require('../config');

const protoFile = path.join(__dirname, '../assets/compress.proto');

const compress = grpc.load(protoFile).compress;
const client = new compress.Compress(config.grpc, grpc.credentials.createInsecure());


function doRequest(request) {
  return new Promise((resolve, reject) => {
    client.do(request, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

// brotli压缩 grpc调用
async function br(buf) {
  const request = new compress.CompressRequest();
  request.setType(compress.Type.BROTLI);
  request.setData(new Uint8Array(buf));
  const res = await doRequest(request);
  return res.data;
}

// gzip压缩 grpc调用
async function gzip(buf) {
  const request = new compress.CompressRequest();
  request.setType(compress.Type.GZIP);
  request.setData(new Uint8Array(buf));
  const res = await doRequest(request);
  return res.data;
}

// 为了计算接收数据的字节数，因为不直接将数据转换
function bufParser(res, fn) {
  const buf = [];
  res.on('data', chunk => buf.push(chunk));
  res.on('end', () => {
    res.body = Buffer.concat(buf);
    fn(null);
  });
}

function unzip(data) {
  return new Promise((resolve, reject) => {
    const unzip = zlib.createUnzip();
    const buf = [];
    unzip.on('error', reject)
    unzip.on('data', chunk => buf.push(chunk));
    unzip.on('end', () => {
      resolve(Buffer.concat(buf));
    });
    unzip.write(data);
    unzip.end();
  });
}

async function get(url) {
  const req = request.get(url)
    .parse(bufParser)
    .buffer(true);
  // 不自动做解压
  const shouldUnzip = req._shouldUnzip;
  req._shouldUnzip = () => false;
  const res = await req;
  let buf = res.body;
  const originalLength = buf.length;
  // 如果是压缩的数据，将数据解压
  if (shouldUnzip(res)) {
    buf = await unzip(buf);
  }
  const brData = await br(buf);
  const gzipData = await gzip(buf);
  return {
    url,
    br: brData.length,
    gzip: gzipData.length,
    original: originalLength,
    bytes: buf.length,
  };
}


async function analyze(pageUrl) {
  const baseUrlInfo = url.parse(pageUrl);
  const res = await request.get(pageUrl);
  const $ = cheerio.load(res.text);
  const assets = [];
  const assetExts = [
    '.js',
    '.css',
  ];
  const join = (src) => {
    if (src.indexOf('http') === 0) {
      return src;
    }
    if (src.indexOf('//') === 0) {
      return baseUrlInfo.protocol + src;
    }
    return urlJoin(pageUrl, src);
  };
  const getExtname = (src) => {
    const info = url.parse(src);
    return path.extname(info.pathname);
  };
  // 将脚本与css的链接过滤出来
  _.forEach($('script, link'), (item) => {
    const dom = $(item);
    const src = dom.attr('src') || dom.attr('href');
    if (src) {
      const ext = getExtname(src);
      // 过滤其它的后续资源
      if (!_.includes(assetExts, ext)) {
        return;
      }
      assets.push(join(src));
    }
  });
  const result = await Promise.map(assets, get, {
    concurrency: 2,
  });
  return result;
}

exports.view = async (ctx) => {
  const currentUrl = ctx.query.url || '';
  _.extend(ctx.state, {
    title: 'tiny-web',
    viewData: {
      currentUrl,
    },
  });
};

exports.analyze = async (ctx) => {
  const currentUrl = ctx.query.url || '';
  if (!currentUrl) {
    ctx.body = null;
    return;
  }
  const result = await analyze(currentUrl);
  _.forEach(result, (item) => {
    const urlInfo = url.parse(item.url);
    item.file = path.basename(urlInfo.pathname);
  });
  ctx.body = result;
};