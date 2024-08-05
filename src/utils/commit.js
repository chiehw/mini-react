import { getDeletions } from "./fiber";
import { updateAttributes } from "./react-dom";

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
        updateAttributes(fiberNode.stateNode, newAttributes, oldAttributes);
    }

    // 先挂载子节点
    commitWork(fiberNode.child);
    // 再挂载兄弟节点
    commitWork(fiberNode.sibling)
}
