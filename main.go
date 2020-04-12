package main

import (
	"flag"
	"net/http"
	"os"
	"time"

	"github.com/vicanso/aslantsite/log"
	"go.uber.org/zap"

	_ "github.com/vicanso/aslantsite/controller"
	"github.com/vicanso/aslantsite/router"
	"github.com/vicanso/elton"
	"github.com/vicanso/elton/middleware"

	humanize "github.com/dustin/go-humanize"
)

var (
	runMode string
)

// 获取监听地址
func getListen() string {
	listen := os.Getenv("LISTEN")
	if listen == "" {
		listen = ":7001"
	}
	return listen
}

func check() {
	listen := getListen()
	url := ""
	if listen[0] == ':' {
		url = "http://127.0.0.1" + listen + "/ping"
	} else {
		url = "http://" + listen + "/ping"
	}
	client := http.Client{
		Timeout: 3 * time.Second,
	}
	resp, err := client.Get(url)
	if err != nil || resp == nil || resp.StatusCode != http.StatusOK {
		os.Exit(1)
		return
	}
	os.Exit(0)
}

func main() {

	flag.StringVar(&runMode, "mode", "", "running mode")
	flag.Parse()

	if runMode == "check" {
		check()
		return
	}
	listen := getListen()

	logger := log.Default()

	d := elton.New()

	d.OnError(func(c *elton.Context, err error) {
		logger.DPanic("unexpected error",
			zap.String("uri", c.Request.RequestURI),
			zap.Error(err),
		)
	})

	d.Use(middleware.NewRecover())

	d.Use(middleware.NewStats(middleware.StatsConfig{
		OnStats: func(statsInfo *middleware.StatsInfo, _ *elton.Context) {
			logger.Info("access log",
				zap.String("ip", statsInfo.IP),
				zap.String("method", statsInfo.Method),
				zap.String("uri", statsInfo.URI),
				zap.Int("status", statsInfo.Status),
				zap.String("consuming", statsInfo.Consuming.String()),
				zap.String("size", humanize.Bytes(uint64(statsInfo.Size))),
			)
		},
	}))

	d.Use(middleware.NewDefaultError())

	d.Use(func(c *elton.Context) error {
		c.NoCache()
		return c.Next()
	})

	d.Use(middleware.NewDefaultFresh())
	d.Use(middleware.NewDefaultETag())

	d.Use(middleware.NewDefaultResponder())

	// health check
	d.GET("/ping", func(c *elton.Context) (err error) {
		c.Body = "pong"
		return
	})

	groups := router.GetGroups()
	for _, g := range groups {
		d.AddGroup(g)
	}

	logger.Info("server will listen on " + listen)
	err := d.ListenAndServe(listen)
	if err != nil {
		panic(err)
	}
}
