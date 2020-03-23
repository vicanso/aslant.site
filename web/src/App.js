import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    const items = [
      {
        name: "IP Location",
        url: "https://ip.npmtrend.com/",
        description: "通过IP地址获取对应的定位信息，可精准到市",
      },
      {
        name: "Tiny",
        url: "https://tiny.npmtrend.com/",
        description: "图片压缩处理，可生成png，jpeg以及webp，可指定缩小尺寸以及质量大小",
      },
      {
        name: "Diving",
        url: "https://diving.npmtrend.com/",
        description: "dive的网页版，可针对docker镜像生成每层的分析数据(增加、删除文件等)，避免重复覆盖的无用数据",
      },
      {
        name: "Free Proxy",
        url: "https://proxy.npmtrend.com/",
        description: "通过爬取网上的免费代理，并以该代理尝试访问wwww.baidu.com后确认是否可用，定时重新检测",
      }
    ].map((item) => {
      return (
        <div
          className="site-app"
        >
          <a
            href={item.url}
          >
            <h5>{item.name}</h5>
            <p>{item.description}</p>
          </a>
        </div>
      );
    });
    const createdAt = 2019;
    const current = new Date().getFullYear();
    let yearDesc = `${createdAt}`
    if (current !== createdAt) {
      yearDesc += `-${current}`;
    }
    return (
      <div className="site">
        <div
          className="site-apps"
        >
          {items}
        </div>
        <footer
          className="site-footer"
        >© {yearDesc} Tree Xie
          <a href="http://www.beian.miit.gov.cn/">粤ICP备17025766号</a>
        </footer>
      </div>
    );
  }
}

export default App;
