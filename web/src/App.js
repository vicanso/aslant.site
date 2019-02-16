import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    const items = [
      {
        name: "IP Location",
        url: "https://ip.aslant.site/",
      },
      {
        name: "Tiny",
        url: "https://tiny.aslant.site/",
      },
      {
        name: "Diving",
        url: "https://diving.aslant.site/",
      },
      {
        name: "Novel",
        url: "https://xs.aslant.site/",
      }
    ].map((item) => {
      return (
        <div
          className="site-app"
        >
          <a
            href={item.url}
          >{item.name}</a>
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
        >© {yearDesc} Tree Xie</footer>
      </div>
    );
  }
}

export default App;
