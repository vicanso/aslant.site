# aslant.site

## docker build

docker build -t vicanso/aslant.site .

## docker run

```bash
docker run -d --restart=always \
  -p 5021:5018 \
  -e NODE_ENV=production \
  --add-host aslant.site:172.18.16.118 \
  vicanso/aslant.site
```
