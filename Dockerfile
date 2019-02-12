FROM golang:1.11-alpine as builder

RUN apk update \
  && apk add git make gcc \
  && git clone --depth=1 https://github.com/vicanso/aslant.site.git /aslant.site \
  && cd /aslant.site \
  && make build

FROM alpine

EXPOSE 7001

COPY --from=builder /aslant.site/aslant-site /usr/local/bin/aslant-site

CMD ["aslant-site"]

HEALTHCHECK --interval=10s --timeout=3s \
  CMD aslant-site --mode=check || exit 1