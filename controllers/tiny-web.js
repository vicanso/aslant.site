const cheerio = require('cheerio');
const _ = require('lodash');
const urlJoin = require('url-join');
const path = require('path');
const url = require('url');
const Promise = require('bluebird');
const axios = require('axios');


async function br(url) {
  const res = await axios.request({
    url: `https://aslant.site/@tiny/optim?type=brotli&url=${encodeURIComponent(url)}`,
    headers: {
      'Accept-Encoding': 'br',
    },
    responseType: 'arraybuffer',
  });
  return Number.parseInt(res.headers['content-length']);
}

async function gzip(url) {
  const res = await axios.request({
    url: `https://aslant.site/@tiny/optim?type=gzip&url=${encodeURIComponent(url)}`,
    headers: {
      'Accept-Encoding': 'gzip',
    },
    responseType: 'arraybuffer',
  });
  return Number.parseInt(res.headers['content-length']);
}

async function get(url) {
  const res = await axios.request({
    url,
    headers: {
      'Accept-Encoding': 'gzip',
    },
    responseType: 'arraybuffer',
  });
  let contentLength = 0;
  if (res.headers['content-length']) {
    contentLength = Number.parseInt(res.headers['content-length']);
  }
  const brSize = await br(url);
  const gzipSize = await gzip(url);
  return {
    url,
    br: brSize,
    gzip: gzipSize,
    original: contentLength,
    bytes: Buffer.from(res.data).length,
  };
}

async function analyze(pageUrl) {
  const baseUrlInfo = url.parse(pageUrl);
  const res = await axios.get(pageUrl);
  const $ = cheerio.load(res.data);
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
  _.forEach($('script, link'), (item) => {
    const dom = $(item);
    const src = dom.attr('src') || dom.attr('href');
    if (src) {
      const ext = getExtname(src);
      if (!_.includes(assetExts, ext)) {
        return;
      }
      assets.push(join(src));
    }
  });
  console.dir(assets);
  const result = await Promise.map(assets, get, {
    concurrency: 2,
  });
  return result;
}

exports.view = async (ctx) => {
  const currentUrl = ctx.query.url || '';
  let result = null;
  if (currentUrl) {
    result = await analyze(currentUrl);
  }
  console.dir(result);
  _.extend(ctx.state, {
    title: 'tiny-web',
    viewData: {
      currentUrl,
    },
  });
};