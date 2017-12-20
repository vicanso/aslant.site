# aslant.site

## docker build

docker build -t vicanso/aslant.site .

## docker run

docker run -d --restart=always -p 5100:5018 -e NODE_ENV=production vicanso/aslant.site
