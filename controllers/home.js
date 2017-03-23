const _ = require('lodash');

module.exports = (ctx) => {
  const viewData = {
    applications: [
      {
        name: 'Aslant',
        url: '/aslant/',
      },
      {
        name: 'Varnish-Generator',
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
