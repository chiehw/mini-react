import ReactDOM from './utils/react-dom.js'
import './index.scss'
import { particles } from './utils/animation.js'

function PixelStyle({ level, levelId }) {
  return (<div className='pixel'>

    <div className='level'>
      <p >Lv.{level}</p>
      <div className='emitter' id={levelId}></div>
    </div>
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

const App = (level, levelId) => {
  return (
    <div className='app'>
      <PixelStyle level={level} levelId={levelId} />
      <Gift />
    </div>
  );
}

let level = 1;
ReactDOM.render(App(level++, 'None'), document.getElementById('root'))
setInterval(() => {
  const emitter = document.getElementById('emitter');
  if (emitter) {
    particles(emitter, 100, 0, 0, -180, 0);
  }

  ReactDOM.render(App(level++, 'emitter'), document.getElementById('root'))
}, 3000)

