

export function commitRoot(rootFiber) {
    // rootFiber 的子节点是 VDOM，所以应该传 child。
    commitWork(rootFiber.child);
}

function commitWork(fiberNode) {
    if (!fiberNode) {
        return;
    }

    // 先挂载子节点
    commitWork(fiberNode.child);
    // 添加到父节点
    let parantDom = fiberNode.return.stateNode;
    parantDom.appendChild(fiberNode.stateNode);
    // 再挂载兄弟节点
    commitWork(fiberNode.sibling)
}
