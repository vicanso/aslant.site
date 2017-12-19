const _ = require('lodash');

module.exports = (ctx) => {
  const viewData = {
    applications: [
      {
        name: 'tiny web',
        url: '/tiny-web/',
      },
      {
        name: 'varnish generator',
        url: '/varnish-generator/',
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
