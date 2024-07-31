import React from 'react'
import ReactDOM from './utils/react-dom.js'
import './index.scss'

function PixelStyle() {
  return (<div className='pixel'>
    <p>Lv.1</p>
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
      <PixelStyle />
      <Gift />
    </div>
  );
}

ReactDOM.render(App(), document.getElementById('root'))