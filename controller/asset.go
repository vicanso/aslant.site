package controller

import (
	"bytes"
	"io"
	"os"

	"github.com/gobuffalo/packr/v2"
	"github.com/vicanso/aslantsite/router"
	"github.com/vicanso/elton"
	"github.com/vicanso/elton/middleware"
)

type (
	// assetCtrl asset ctrl
	assetCtrl struct {
	}
	staticFile struct {
		box *packr.Box
	}
)

var (
	box = packr.New("asset", "../web/build")
)

func (sf *staticFile) Exists(file string) bool {
	return sf.box.Has(file)
}
func (sf *staticFile) Get(file string) ([]byte, error) {
	return sf.box.Find(file)
}
func (sf *staticFile) Stat(file string) os.FileInfo {
	return nil
}
func (sf *staticFile) NewReader(file string) (io.Reader, error) {
	buf, err := sf.Get(file)
	if err != nil {
		return nil, err
	}
	return bytes.NewReader(buf), nil
}

func init() {
	g := router.NewGroup("")
	ctrl := assetCtrl{}
	g.GET("/", noQuery, ctrl.index)
	g.GET("/favicon.ico", ctrl.favIcon)

	sf := &staticFile{
		box: box,
	}
	g.GET("/static/*", middleware.NewStaticServe(sf, middleware.StaticServeConfig{
		Path: "/static",
		// 客户端缓存一年
		MaxAge: 365 * 24 * 3600,
		// 缓存服务器缓存一个小时
		SMaxAge:             60 * 60,
		DenyQueryString:     true,
		DisableLastModified: true,
	}))

}

func sendFile(c *elton.Context, file string) (err error) {
	buf, err := box.Find(file)
	if err != nil {
		return
	}
	c.SetContentTypeByExt(file)
	c.BodyBuffer = bytes.NewBuffer(buf)
	return
}

func (ctrl assetCtrl) index(c *elton.Context) (err error) {
	c.CacheMaxAge("10s")
	return sendFile(c, "index.html")
}

func (ctrl assetCtrl) favIcon(c *elton.Context) (err error) {
	c.CacheMaxAge("10m")
	return sendFile(c, "favicon.ico")
}
