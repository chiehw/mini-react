import { renderDom } from "./react-dom";
import { commitRoot } from "./commit";


let nextUnitOfWork = null;  // 当前的工作节点
let currentRoot = null; // 显示中的 Fiber 树
let workInProgressRoot = null; // 渲染中的 Fiber 树

export function createRoot(element, container) {
  workInProgressRoot = {
    stateNode: container, // stateNode 用于存储 DOM 节点。
    return: null, // 上一个节点
    element: {  // element 用于存储 VDOM 的节点。
      props: {
        children: [element]
      }
    },
  }
  // 设置工作节点
  nextUnitOfWork = workInProgressRoot;
}

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

    // 构造 Fiber 树 中的兄弟节点和子节点。
    let index = 0;  // 子节点下标
    let prevSibling = null; // 记录上一个兄弟节点，用于连接 sibling

    while (index < elements.length) {
      const element = elements[index];
      const newFiber = {
        element,
        return: workInProgress,
        stateNode: null
      }

      if (index === 0) {
        workInProgress.child = newFiber;  // 注意这里是 Fiber 的 child，在 VDOM 中是 children。
      } else {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
      index++;
    }
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
    }
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 重新设置回调
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);