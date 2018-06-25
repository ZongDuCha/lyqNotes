// 在写一个jsHTML结构对象,实现渲染真实的dom元素
function renderNode(obj){
    const elNode = document.createElement( obj.tagName )

    // 文本内容
    elNode.innerText = obj.innerText || ''

    // 渲染props属性值
    if( !!obj.props.length ){
        obj.props =  Object.assign(...obj.props)
        for(let i in obj.props){
            elNode.setAttribute(i, obj.props[i])
        }
    }

    // 深度遍历子节点元素
    if(!!obj.children.length){
        for(let i in obj.children){
            elNode.appendChild( renderNode( obj.children[i] ) )
        }
    }
    return elNode
}