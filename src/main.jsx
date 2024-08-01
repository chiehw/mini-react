import React from 'react'
import ReactDOM from './utils/react-dom.js'
import './index.scss'

function PixelStyle({ level }) {
  return (<div className='pixel'>
    <p>Lv.{level}</p>
    <div className="cat pix"></div>
    <div className="box">By chieh</div>
  </div>)
}

function Gift() {
  return (<div className="container">
    <div className="item">
      <div className="horse pix"></div>
    </div>
    <div className="item">
      <div className="megane pix"></div>
    </div>
    <div className="item">
      <div className="rose pix"></div>
    </div>
  </div>)
}

const App = () => {
  return (
    <div className='app'>
      <PixelStyle level={1} />
      <Gift />
    </div>
  );
}

ReactDOM.render(App(), document.getElementById('root'))