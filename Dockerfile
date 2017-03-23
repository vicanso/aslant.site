FROM node:alpine

STOPSIGNAL SIGINT

ADD ./ /app

RUN cd /app && npm i --production --registry=https://registry.npm.taobao.org && rm /root/.npm/* -rf

CMD cd /app && npm start
