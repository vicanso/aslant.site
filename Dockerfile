FROM node:8

STOPSIGNAL SIGINT

ADD ./ /app

RUN cd /app && npm i --production && npm cache clean --force

CMD cd /app && npm start
