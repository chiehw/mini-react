import ReactDOM from './mini-react/react-dom.js'
import './index.scss'
import { particles } from './utils/animation.js'
import { useState } from './mini-react/react.js'

function PixelStyle() {
  const [level, setLevel] = useState(1)

  const handleClick = () => {
    setLevel((level => level + 1))
    const emitter = document.getElementById('emitter');
    if (emitter) {
      particles(emitter, 100, 0, 0, -180, 0);
    }
  }

  return (<div className='pixel'>
    <div className='level'>
      <p >Lv.{level}</p>
      <div className='emitter' id="emitter" ></div>
    </div>
    <div className="cat pix" onClick={handleClick} ></div>
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
