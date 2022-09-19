FROM node:10-alpine as webbuilder

RUN apk update \
  && apk add git \
  && git clone --depth=1 https://github.com/vicanso/aslant.site.git /aslant.site \
  && cd /aslant.site/web \
  && npm i \
  && npm run build \
  && rm -rf node_modules

FROM golang:1.18-alpine as builder

COPY --from=webbuilder /aslant.site /aslant.site

RUN apk update \
  && apk add git make gcc \
  && go env -w GO111MODULE=on \
  && go env -w GOPROXY=https://goproxy.cn,direct \
  && go install github.com/gobuffalo/packr/v2/packr2@v2.8.3 \
  && cd /aslant.site \
  && make build

FROM alpine

EXPOSE 7001

COPY --from=builder /aslant.site/aslant-site /usr/local/bin/aslant-site

CMD ["aslant-site"]

HEALTHCHECK --interval=10s --timeout=3s \
  CMD aslant-site --mode=check || exit 1
