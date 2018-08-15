const _ = require('lodash');

module.exports = (ctx) => {
  const viewData = {
    applications: [
      {
        name: 'tiny web',
        url: '/tiny-web/',
        desc: '对网址分析静态文件，生成数据压缩效果',
      },
      {
        name: 'varnish generator',
        url: '/varnish-generator/',
        desc: '生成varnish的配置文件',
      },
      {
        name: 'tiny',
        url: 'http://tiny.aslant.site/',
        desc: '图片、文件的各类压缩功能',
      },
    ],
  };
  _.extend(ctx.state, {
    title: 'aslant.site',
    viewData,
  });
};
