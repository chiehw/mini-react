/** 粒子特效 */
export function particles(parent, quantity, x, y, minAngle, maxAngle) {
  // 清除现有的粒子，避免叠加
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  
  let colors = [
    '#FFFF04',
    '#EA4C89',
    '#892AB8',
    '#4AF2FD',
  ];
  for (let i = quantity - 1; i >= 0; i--) {
    let angle = gsap.utils.random(minAngle, maxAngle),
      velocity = gsap.utils.random(70, 140),
      dot = document.createElement('div');
    dot.style.setProperty('--b', colors[Math.floor(gsap.utils.random(0, 4))]);
    parent.appendChild(dot);
    gsap.set(dot, {
      opacity: 0,
      x: x,
      y: y,
      scale: gsap.utils.random(.4, .7)
    });
    gsap.timeline({
      onComplete() {
        dot.remove();
      }
    }).to(dot, {
      duration: .05,
      opacity: 1
    }, 0).to(dot, {
      duration: 1.8,
      rotationX: `-=${gsap.utils.random(720, 1440)}`,
      rotationZ: `+=${gsap.utils.random(720, 1440)}`,
      physics2D: {
        angle: angle,
        velocity: velocity,
        gravity: 120
      }
    }, 0).to(dot, {
      duration: 1,
      opacity: 0
    }, .8);
  }
}