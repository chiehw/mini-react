export let hostConfig = {}

/**
 * VDOM 是一个树形结构，递归遍历 VDOM，将 VDOM 渲染为真实 DOM
 * @param {*} element：element 可能是基础的数据类型、Object
 */
export function renderToHost(element) {
  let dom = null;

  // element 可能为 null、undefined、0
  if (!element && element !== 0) {
    return null;
  }

  // 处理基础的元素
  if (typeof element === 'string') {
    return hostConfig.createTextInstance(element);
  }
  if (typeof element === 'number') {
    return hostConfig.createTextInstance(element);
  }

  const {
    type,
    props: { children, ...attributes }
  } = element;

  if (typeof type === 'string') {
    // 普通的标签，如 h1、h2
    dom = hostConfig.createInstance(type, attributes);
  } if (typeof type === 'function') {
    dom = hostConfig.createInstance('div', attributes);  // DocumentFragment 为空时，不能挂载到父节点。
  }

  hostConfig.commitUpdate(dom, {}, {}, {}, attributes);
  return dom;
}


let nextUnitOfWork = null;  // 当前的工作节点
let currentRoot = null; // 显示中的 Fiber 树
let workInProgressRoot = null; // 渲染中的 Fiber 树

let deletions = []

let currentFunctionFiber = null;  // 当前的函数组件的 Fiber 节点
let hookIndex = 0;  // 函数组件中 Hook 的位置

export function deleteFiber(fiberNode) {
  deletions.push(fiberNode)
}

export function getDeletions() {
  return deletions;
}

export function getCurrentFunctionFiber() {
  return currentFunctionFiber;
}

export function getHookIndex() {
  return hookIndex;
}

export function commitRender() {    
  // 重新设置工作树、当前工作单元。
  workInProgressRoot = {
    stateNode: hostConfig.getChildHostContext().stateNode,
    element: hostConfig.getChildHostContext().element,
    alternate: hostConfig.getChildHostContext()
  };
  nextUnitOfWork = workInProgressRoot;
}

export function createRoot(element, container) {
  workInProgressRoot = {
    stateNode: container, // stateNode 用于存储 DOM 节点。
    return: null, // 上一个节点
    element: {  // element 用于存储 VDOM 的节点。
      props: {
        children: [element]
      }
    },
    alternate: currentRoot,
  }
  // 设置工作节点
  nextUnitOfWork = workInProgressRoot;
}

/**
 * 构造 Fiber 树 中的兄弟节点和子节点，diff 算法进行标记。
 * @param {*} workInProgress : 渲染中的子树
 * @param {*} elements ： 下层的所有节点
 */
function reconcileChildren(workInProgress, elements) {
  let index = 0;  // 子节点下标
  let prevSibling = null; // 记录上一个兄弟节点，用于连接 sibling
  let oldFiber = workInProgress.alternate?.child // 正在显示中的 Fiber 树的子节点。  

  // 遍历子节点、旧的子节点
  while (index < elements.length | oldFiber) {
    const element = elements[index];
    let newFiber = null

    /* diff算法：对比新旧节点的类型。
       1. 当 element 是数组或字母时不比较。
    */
    const isSameType = element?.type && oldFiber?.element?.type && element.type === oldFiber.element.type;
    if (isSameType) {
      // 如果类型相同，表示更新。
      newFiber = {
        element: {
          ...element,
          props: element.props  // 确保被更新
        },
        stateNode: oldFiber.stateNode,
        return: workInProgress,
        alternate: oldFiber,
        flag: 'Update'
      }
    } else {
      // 如果类型不同，表示在新 Fiber 树上增加节点，删除旧的节点。
      if (element || element === 0) {
        newFiber = {
          element,
          stateNode: null,
          return: workInProgress,
          alternate: oldFiber,
          flag: 'Placement',
          index
        }
      }
      if (oldFiber) {
        oldFiber.flag = 'Deletion';
        deleteFiber(oldFiber);
      }
    }

    if (index === 0) {
      workInProgress.child = newFiber;  // 注意这里是 Fiber 的 child，在 VDOM 中是 children。
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;

    index++;  // 遍历 element 数组
    if (oldFiber) { // oldFiber 存在，则继续遍历其 sibling
      oldFiber = oldFiber.sibling;
    }
  }
}

function updateFunctionComponent(fiberNode) {
  // 记录当前的函数组件、hook 的下标
  currentFunctionFiber = fiberNode;
  currentFunctionFiber.hooks = [];
  hookIndex = 0;

  const { props, type: Fn } = currentFunctionFiber.element;
  const vdom = Fn(props);

  reconcileChildren(fiberNode, [vdom])
}

export function commitRoot(rootFiber) {
  const deletions = getDeletions();
  deletions.forEach(commitWork);

  // rootFiber 的子节点是 VDOM，所以应该传 child。
  commitWork(rootFiber.child);
}

function commitWork(fiberNode) {
  if (!fiberNode) {
    return;
  }
  // 添加到父节点
  let parantDom = fiberNode.return.stateNode;

  if (fiberNode.flag === 'Deletion') {
    if (typeof fiberNode.element?.type !== 'function') {
      // 记得将 delection 置空
      if (parantDom.contains(fiberNode.stateNode)) {
        parantDom.removeChild(fiberNode.stateNode);
      }
    }
    return;
  }

  if (fiberNode.flag === 'Placement') {
    const targetPositionDom = parantDom.childNodes[fiberNode.index];
    if (targetPositionDom) {
      // 找到插入位置
      parantDom.insertBefore(fiberNode.stateNode, targetPositionDom);
    } else {
      // 放在最后面
      parantDom.appendChild(fiberNode.stateNode);
    }
  } else if (fiberNode.flag === 'Update') {
    const { children, ...newAttributes } = fiberNode.element.props;
    const oldAttributes = Object.assign({}, fiberNode.alternate.element.props);
    delete oldAttributes.children;
    /* 大部分组件会被标记为更新，但是属性也不一定能会发生变化，这里可以优化。 */
    hostConfig.commitUpdate(fiberNode.stateNode, {}, {}, {}, newAttributes);
  }

  // 先挂载子节点
  commitWork(fiberNode.child);
  // 再挂载兄弟节点
  commitWork(fiberNode.sibling)
}


/**
 * 构造 Fiber 树，以及设置下一个工作节点。
 * @param {*} workInProgress ：渲染中的子树
 * @returns 
 */
function performUnitOfWork(workInProgress) {
  /** 构建 DOM 树 */
  if (!workInProgress.stateNode) {
    // 如果当前节点没有 DOM 树
    workInProgress.stateNode = renderToHost(workInProgress.element)
  }

  /** 构造 Fiber 树 */
  let children = workInProgress.element?.props?.children;
  let type = workInProgress.element?.type;

  if (typeof type === 'function') {
    // 函数组件
    updateFunctionComponent(workInProgress)
  }

  if (children || children === 0) {
    let elements = Array.isArray(children) ? children : [children];
    elements = elements.flat();

    reconcileChildren(workInProgress, elements)
  }

  /** 设置下一个工作单元 */
  if (workInProgress.child) {
    // 优先子节点
    nextUnitOfWork = workInProgress.child;
  } else {
    // 没有子节点就寻找兄弟节点，或者上层的兄弟节点。
    let nextFiber = workInProgress;
    while (nextFiber) {
      if (nextFiber.sibling) {
        nextUnitOfWork = nextFiber.sibling;
        return;
      } else {
        nextFiber = nextFiber.return;
      }
    }
    if (!nextFiber) {
      nextUnitOfWork = null;
    }
  }
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    performUnitOfWork(nextUnitOfWork);
    // 没有工作节点并且渲染中有树，代表渲染完成
    if (!nextUnitOfWork && workInProgressRoot) {
      commitRoot(workInProgressRoot);
      // Fiber 树利用了双缓冲机制
      currentRoot = workInProgressRoot;
      workInProgressRoot = null;
      deletions = [];
    }
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 重新设置回调
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);