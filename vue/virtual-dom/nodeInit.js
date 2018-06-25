// 将html结构换js对象
function nodeInit(el) {
    // 判断传入类型
    let elNode = typeof el == 'string' ? document.querySelector(el) : el
    // 判断传入有效元素值
    if (!el || !(elNode instanceof HTMLCollection) && !(elNode instanceof Element)) {
        throw (el + ' This is not an effective value.')
        return false;
    }
    const vm = { // 记录元素的属性值
        elNode, // 元素节点
        props: [], // 元素属性值
        children: [], // 元素子元素
        html: elNode.innerHTML, // 内容
        tagNmae: elNode.tagName.toLowerCase()
    }
    for (let i in vm.elNode) { // 遍历属性值
        console.log( i == ':id' )
        vm.props.push({
            [i]: vm.elNode[i]
        })
    }
    if (!!elNode.children) { // 如果有子节点
        for (let i = 0, len = elNode.children.length; i < len; i++) {
            // 深度遍历 
            vm.children[i] = nodeInit(elNode.children[i])
        }
    }
    return vm
}