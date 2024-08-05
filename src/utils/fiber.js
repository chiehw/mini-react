import { renderDom } from "./react-dom";
import { commitRoot } from "./commit";


let nextUnitOfWork = null;  // 当前的工作节点
let currentRoot = null; // 显示中的 Fiber 树
let workInProgressRoot = null; // 渲染中的 Fiber 树

let deletions = []

export function deleteFiber(fiberNode) {
  deletions.push(fiberNode)
}

export function getDeletions() {
  return deletions;
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

/**
 * 
 * @param {*} workInProgress ：渲染中的子树
 * @returns 
 */
function performUnitOfWork(workInProgress) {
  /** 构建 DOM 树 */
  if (!workInProgress.stateNode) {
    // 如果当前节点没有 DOM 树
    workInProgress.stateNode = renderDom(workInProgress.element)
  }

  /** 构造 Fiber 树 */
  let children = workInProgress.element?.props?.children;
  let type = workInProgress.element?.type;

  if (typeof type === 'function') {
    // 函数组件
    const { props, type: Fn } = workInProgress.element;
    const vdom = Fn(props);
    children = [vdom]
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