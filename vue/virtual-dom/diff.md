### diff 记录新旧dom节点差异

这一步部分主要是数据更新的核心代码（diff算法），渲染真实dom节点到页面上

然后开始将旧子节点组和新子节点组进行逐一比对，直到遍历完任一子节点组，比对策略有5种：
* oldStartVnode和newStartVnode进行比对，如果相似，则进行patch，然后新旧头索引都后移
* oldEndVnode和newEndVnode进行比对，如果相似，则进行patch，然后新旧尾索引前移
* oldStartVnode和newEndVnode进行比对，如果相似，则进行patch，将旧节点移位到最后
* oldEndVnode和newStartVnode进行比对，处理和上面类似，只不过改为左移
* 如果以上情况都失败了，我们就只能复用key相同的节点了。首先我们要通过createKeyToOldIdx
* 遍历完之后，将剩余的新Vnode添加到最后一个新节点的位置后或者删除多余的旧节点

![](https://images2015.cnblogs.com/blog/572874/201705/572874-20170505153104851-108994539.png)

vue的`update`比较复杂，来看看带注释的简化版，其思想都差不多，也是snabbdom的核心源码:
```js
  /**
   *
  * @param parentElm 父节点
  * @param oldCh 旧节点数组
  * @param newCh 新节点数组
  * @param insertedVnodeQueue
  */
function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
  var oldStartIdx = 0, newStartIdx = 0;
  var oldEndIdx = oldCh.length - 1;
  var oldStartVnode = oldCh[0];
  var oldEndVnode = oldCh[oldEndIdx];
  var newEndIdx = newCh.length - 1;
  var newStartVnode = newCh[0];
  var newEndVnode = newCh[newEndIdx];
  var oldKeyToIdx, idxInOld, elmToMove, before;

  // 当老节点开始索引 小于等于 老节点的结尾索引
  // 并且新节点开始索引 小于等于 新节点的结尾索引
  // 的时候结束整个循环
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    }
    //如果旧头索引节点和新头索引节点相同，
    else if (sameVnode(oldStartVnode, newStartVnode)) {
      //对旧头索引节点和新头索引节点进行diff更新， 从而达到复用节点效果
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
      //旧头索引向后
      oldStartVnode = oldCh[++oldStartIdx];
      //新头索引向后
      newStartVnode = newCh[++newStartIdx];
    }
    //如果旧尾索引节点和新尾索引节点相似，可以复用
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      //旧尾索引节点和新尾索引节点进行更新
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
      //旧尾索引向前
      oldEndVnode = oldCh[--oldEndIdx];
      //新尾索引向前
      newEndVnode = newCh[--newEndIdx];
    }
      //  如果旧头索引节点和新头索引节点相似，可以通过移动来复用
      //  如旧节点为【5,1,2,3,4】，新节点为【1,2,3,4,5】，如果缺乏这种判断，意味着
      //  那样需要先将5->1,1->2,2->3,3->4,4->5五次删除插入操作，即使是有了key-index来复用，
      //  也会出现【5,1,2,3,4】->【1,5,2,3,4】->【1,2,5,3,4】->【1,2,3,5,4】->【1,2,3,4,5】
      //  共4次操作，如果有了这种判断，我们只需要将5插入到最后一次操作即可
    else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
      api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    //原理与上面相同
    else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
      api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    //如果上面的判断都不通过，我们就需要key-index表来达到最大程度复用了
    else {
      //如果不存在旧节点的key-index表，则创建
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      //找到新节点在旧节点组中对应节点的位置
      idxInOld = oldKeyToIdx[newStartVnode.key];
      //如果新节点在旧节点中不存在，我们将它插入到旧头索引节点前，然后新头索引向后
      if (isUndef(idxInOld)) { // New element
        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
        newStartVnode = newCh[++newStartIdx];
      } else {
        //如果新节点在就旧节点组中存在，先找到对应的旧节点
        elmToMove = oldCh[idxInOld];
        //先将新节点和对应旧节点作更新
        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
        //然后将旧节点组中对应节点设置为undefined,代表已经遍历过了，不在遍历，否则可能存在重复插入的问题

        oldCh[idxInOld] = undefined;
        //插入到旧头索引节点之前
        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
        //新头索引向后
        newStartVnode = newCh[++newStartIdx];
      }
    }
  }
  //当旧头索引大于旧尾索引时，代表旧节点组已经遍历完，将剩余的新Vnode添加到最后一个新节点的位置后
  if (oldStartIdx > oldEndIdx) {
    before = isUndef(newCh[newEndIdx+1]) ? null : newCh[newEndIdx+1].elm;
    addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
  }
  //如果新节点组先遍历完，那么代表旧节点组中剩余节点都不需要，所以直接删除
  else if (newStartIdx > newEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }
}
```