/**
 * 将 Virtual DOM 转换为 DOM
 * @param {*} element: Virtual DOM
 * @param {Document} container: 根据 ID 获取的实际 DOM。
 */
function render(element, container) {
  console.log('==Virtual DOM==', element);
  const dom = renderDom(element);
  // 挂载新的 DOM 到真实 DOM 上
  container.appendChild(dom);
}

/**
 * VDOM 是一个树形结构，递归遍历 VDOM，将 VDOM 渲染为真实 DOM
 * @param {*} element：element 可能是基础的数据类型、Object
 */
function renderDom(element) {
  let dom = null;

  // element 可能为 null、undefined、0
  if (!element && element !== 0) {
    return null;
  }

  // 处理基础的元素
  if (typeof element === 'string') {
    return document.createTextNode(element);
  }
  if (typeof element === 'number') {
    return document.createTextNode(element);
  }

  // children 可能为数组或对象
  if (Array.isArray(element)) {
    dom = document.createDocumentFragment();
    for (let item of element) {
      const subDom = renderDom(item);
      dom.appendChild(subDom);
    }
    return dom;
  }

  const {
    type,
    props: { children, ...attributes }
  } = element;

  if (typeof type === 'string') {
    // 普通的标签，如 h1、h2
    dom = document.createElement(type);
  } else if (typeof type === 'function') {
    // 函数组件
    const { props, type: Fn } = element;
    const vdom = Fn(props);
    dom = renderDom(vdom);
  }

  if (children) {
    const childrenDom = renderDom(children);
    if (childrenDom) {
      dom.appendChild(childrenDom);
    }
  }
  updateAttributes(dom, attributes);
  return dom;
}

/**
 * 
 * @param {Document} dom : DOM 节点
 * @param {Object} attributes : DOM 节点参数
 */
function updateAttributes(dom, attributes) {
  Object.keys(attributes).forEach(key => {
    if (key.startsWith('on')) {
      // 处理事件
      const eventName = key.slice(2).toLowerCase();
      dom.addEventListener(eventName, attributes[key]);
    } else if (key === 'className') {
      // 处理 className
      const classes = attributes[key].split(' ');
      classes.forEach((classKey) => {
        dom.classList.add(classKey);
      });
    } else if (key === 'style') {
      const styleObj = attributes[key];
      Object.keys(styleObj).forEach(styleName => {
        dom.style[styleName] = styleObj[styleName];
      });
    } else {
      dom[key] = attributes[key];
    }
  })
}

const ReactDOM = {
  render,
};
export default ReactDOM;