import { createRoot, hostConfig } from "./reconciler";
import ReactReconciler from 'react-reconciler';

const DomHostConfig = {
  /** ============================= */
  now: Date.now,
  getRootHostContext: () => {    
    return rootHostContext;
  },
  prepareForCommit: () => { },
  resetAfterCommit: () => { },
  getChildHostContext: () => {
    return childHostContext;
  },
  shouldSetTextContent: (type, props) => {
    return typeof props.children === 'string' || typeof props.children === 'number';
  },
  clearContainer() { },
  removeChildFromContainer() { },
  detachDeletedInstance() { },
  /** 映射到 domElement.appendChild。此函数被调用以创建初始 UI 树。 */
  appendInitialChild: (parent, child) => {
    parent.appendChild(child);
  },
  finalizeInitialChildren: (domElement, type, props) => { },
  supportsMutation: true,
  /** 映射到 domElement.appendChild。在 react-reconciler 的 commitPhase 中被调用 */
  appendChildToContainer: (parent, child) => {    
    parent.appendChild(child);
  },
  /** ============================= */


  /**
   这是 react-reconciler 想要根据目标创建 UI 元素实例的地方。由于我们的目标是 DOM，我们将创建 document.createElement 并且 type 是包含类型字符串的参数，如 div 或 img 或 h1 等。domElement 属性的初始值可以在此函数中从 newProps 参数设置
   */
  createInstance: (type, newProps, rootContainerInstance, _currentHostContext, workInProgress) => {
    const domElement = document.createElement(type);
    Object.keys(newProps).forEach(propName => {
      const propValue = newProps[propName];
      if (propName === 'children') {
        if (typeof propValue === 'string' || typeof propValue === 'number') {
          domElement.textContent = propValue;
        }
      } else if (propName === 'onClick') {
        domElement.addEventListener('click', propValue);
      } else if (propName === 'className') {
        domElement.setAttribute('class', propValue);
      } else {
        const propValue = newProps[propName];
        domElement.setAttribute(propName, propValue);
      }
    });
    return domElement;
  },
  /** 如果目标只允许在单独的文本节点中创建文本，则此函数用于创建单独的文本节点。 */
  createTextInstance: text => {
    return document.createTextNode(text);
  },
  /** 映射到 domElement.appendChild。类似于 appendInitialChild 但用于后续的树操作。 */
  appendChild(parent, child) {
    parent.appendChild(child);
  },
  /** 这是我们想要区分 oldProps 和 newProps 并决定是否更新的地方。在我们的实现中，为简单起见，我们只是将其设置为 true。 */
  prepareUpdate(domElement, oldProps, newProps) {
    return true;
  },
  /** 此函数用于随后根据值更新domElement属性。newProps */
  commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
    Object.keys(newProps).forEach(propName => {
      const propValue = newProps[propName];
      if (propName === 'children') {
        if (typeof propValue === 'string' || typeof propValue === 'number') {
          domElement.textContent = propValue;
        }
      } else {
        const propValue = newProps[propName];
        domElement.setAttribute(propName, propValue);
      }
    });
  },
  commitTextUpdate(textInstance, oldText, newText) {
    textInstance.text = newText;
  },
  // removeChild：映射到 domElement.removeChild。 
  removeChild(parentInstance, child) {
    parentInstance.removeChild(child);
  },

  /** 由于 reconciler 不同，useState 也会不同 */
};

/**
 * 
 * @param {Document} dom : DOM 节点
 * @param {Object} attributes : DOM 节点参数
 * @param {Object} oldAttributes: DOM 旧的参数
 */
export function updateAttributes(dom, attributes, oldAttributes) {
  if (oldAttributes) {
    Object.keys(oldAttributes).forEach(key => {
      if (key.startsWith('on')) {
        // 移除旧事件
        const eventName = key.slice(2).toLowerCase()
        dom.removeEventListener(eventName, attributes[key]);
      } else if (key === 'className') {
        // 移除 className
        const classes = attributes[key].split(' ');
        classes.forEach((classKey) => {
          dom.classList.remove(classKey);
        });
      } else if (key === 'style') {
        const styleObj = attributes[key];
        Object.keys(styleObj).forEach(styleName => {
          dom.style[styleName] = 'initial';
        });
      } else {
        dom[key] = ''
      }
    });
  }

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

const rootHostContext = {};
const childHostContext = {};
const ReactReconcilerInst = ReactReconciler(DomHostConfig);

/**
 * 将 Virtual DOM 转换为 DOM
 * @param {*} element: Virtual DOM
 * @param {Document} container: 根据 ID 获取的实际 DOM。
 */
function render(reactElement, domElement, callback) {
  Object.assign(hostConfig, DomHostConfig)
  if (!domElement._rootContainer) {
    domElement._rootContainer = ReactReconcilerInst.createContainer(domElement, false);
  }
  return ReactReconcilerInst.updateContainer(reactElement, domElement._rootContainer, null, callback);
}

function customFiberRender(element, container) {
  Object.assign(hostConfig, DomHostConfig)
  createRoot(element, container)
}

const ReactDOM = {
  render: render,
};
export default ReactDOM;