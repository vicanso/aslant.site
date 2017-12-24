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
const phantom = require('phantom');

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

async function webp(buf, imageType) {
  const quality = imageType === 'png' ? 0 : 75;
  const request = new compress.CompressRequest();
  request.setType(compress.Type.WEBP);
  request.setData(new Uint8Array(buf));
  request.setQuality(quality);
  request.setImageType(imageType);
  const res = await doRequest(request);
  return res.data; 
}

async function jpeg(buf, imageType) {
  const request = new compress.CompressRequest();
  request.setType(compress.Type.JPEG);
  request.setData(new Uint8Array(buf));
  request.setQuality(75);
  request.setImageType(imageType);
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

async function get(url, type) {
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
  const result = {
    url,
    original: originalLength,
    bytes: buf.length, 
  };
  const imgList = [
    'png',
    'jpeg',
    'jpg',
  ];
  if (_.includes(imgList, type)) {
    let imageType = 'jpeg';
    if(type === 'png') {
      imageType = 'png';
      result.png = result.original;
    } else {
      const jpegData = await jpegData(buf, imageType);
      result.jpeg = jpegData.length;
    }
    try {
      const webpData = await webp(buf, imageType);
      result.webp = webpData.length;
    } catch (err) {

    }
  } else {
    const brData = await br(buf);
    const gzipData = await gzip(buf);
    result.br = brData.length;
    result.gzip = gzipData.length;
  }
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

exports.compress = async (ctx) => {
  ctx.set('Cache-Control', 'public, max-age=300');
  const query = ctx.query;
  ctx.body = await get(query.url, query.type);
}

exports.analyze = async (ctx) => {
  const currentUrl = ctx.query.url || '';
  if (!currentUrl) {
    ctx.body = null;
    return;
  }
  const instance = await phantom.create(); 
  const page = await instance.createPage();
  const images = [];
  const texts = [];
  page.on('onResourceReceived', (res) => {
    const resUrl = res.url;
    if (resUrl.indexOf('http') !== 0) {
      return;
    }
    const isText = /javascript|css/.test(res.contentType);
    const isImage = /image/.test(res.contentType);
    if (isText) {
      if (!_.includes(texts, resUrl)) {
        texts.push(resUrl);
      }
    } else if (isImage) {
      if (!_.includes(images, resUrl)) {
        images.push(resUrl);
      }
    }
  });
  await page.open(currentUrl);
  await instance.exit();
  const urls = [];
  const convert = (urls, type) => _.map(urls, (item) => {
    const urlInfo = url.parse(item);
    const file = path.basename(urlInfo.pathname);
    return {
      type: path.extname(file).substring(1),
      file,
      url: item,
    };
  });
  urls.push(...convert(texts, 'text'));
  urls.push(...convert(images, 'image'));
  ctx.set('Cache-Control', 'public, max-age=300');
  ctx.body = {
    list: urls,
  };
};