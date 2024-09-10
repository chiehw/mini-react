import { getCurrentFunctionFiber, getHookIndex, commitRender } from "./reconciler";

export function useState(initial) {
  const currentFunctionFiber = getCurrentFunctionFiber();
  const hookIndex = getHookIndex();
  // 更新前的 Hook
  const oldHook = currentFunctionFiber?.alternate?.hooks?.[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial, // 如果有旧的 Hook，就使用旧值。
    queue: [],  // 用于 setState 函数执行传递过来的 action，用于统一更新值。
  }

  // 使用 action 来更新状态。
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    if (typeof action === 'function') {
      hook.queue.push(action);
    } else {
      hook.queue.push(() => {
        return action;
      });
    }
    // 触发重新渲染组件
    commitRender();
  }  

  // 将 Hook 保存到 Fiber 中
  // currentFunctionFiber?.hooks.push(hook);
  return [hook.state, setState]
}