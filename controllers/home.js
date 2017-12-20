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
        name: 'TODO',
        url: '#',
      },
    ],
  };
  _.extend(ctx.state, {
    title: 'aslant.site',
    viewData,
  });
};
