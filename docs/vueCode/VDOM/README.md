# VUE源码解析--虚拟DOM和diff算法
  
  ## 虚拟DOM

  虚拟DOM，是与我们在浏览器中看到的DOM节点相对应的；

  Vue中用一个VNode对象来描述虚拟DOM，也就是用一个JS对象来描述真实的DOM节点的属性

  ### 那为什么要使用虚拟DOM呢？

  Vue能够响应数据的变化从而改变视图，更新视图也就会改变dom树结构，而我们又知道更新DOM节点是一个很耗费性能的事情（[为什么](https://www.cnblogs.com/padding1015/p/11405788.html)），所以使用虚拟DOM来描述真实的dom节点，然后通过diff算法来对比新旧两个虚拟DOM节点的区别，从而减少对真实DOM的操作，提升性能
  
  ### Vue中的虚拟DOM
   
  Vue中就是通过VNode类来描述我们页面中看到的真实DOM节点的

  ``` javascript
    export default class VNode {
      // 定义了一堆变量
      ...

      constructor (
        tag?: string,
        data?: VNodeData,
        children?: ?Array<VNode>,
        text?: string,
        elm?: Node,
        context?: Component,
        componentOptions?: VNodeComponentOptions,
        asyncFactory?: Function
      ) {
        this.tag = tag   // 用于存储当前节点对应的真实DOM标签名
        this.data = data  // 当前节点的数据对象，用于描述节点的特征参数集合
        this.children = children // 当前节点的子节点，Vnode类型数组
        this.text = text  // 文本节点的内容
        this.elm = elm   // 节点对应的真实DOM元素，用于对比完了之后操作DOM使用
        this.ns = undefined // 节点命名空间，使用document.createElementNS()
        this.context = context // Vue实例 表示当前节点绑定的vue实例
        this.fnContext = undefined // 函数式组件对应的Vue实例
        this.fnOptions = undefined //  同 componentOptions 属性
        this.fnScopeId = undefined
        this.key = data && data.key  // 节点的key属性，被当做节点的标志，用于优化
        this.componentOptions = componentOptions   // 类似vue实例中的option参数 ---用于组件节点中 存储 组件的props、data  methods属性等等
        this.componentInstance = undefined  // 表示当前组件是挂载到哪个Vue实例下面的
        this.parent = undefined  // 当前节点的父节点
        this.raw = false  // 是否是通过InnerHTML生成,
        this.isStatic = false // 是否为静态节点 --- 不会依赖动态数据的节点
        this.isRootInsert = true  // 是否为根节点
        this.isComment = false   // 注释节点标识
        this.isCloned = false   // 克隆节点标识
        this.isOnce = false     // 是否只渲染一次标识（v-once）
        this.asyncFactory = asyncFactory
        this.asyncMeta = undefined
        this.isAsyncPlaceholder = false
      }
    }

  ```
  

  除此之外，Vue还提供了几种简单的节点类型：
  1. 注释节点
  ``` javascript 
    export const createEmptyVNode = (text: string = '') => {
      const node = new VNode()
      node.text = text
      node.isComment = true
      return node
    }
  ```
  2. 文本节点
  ``` javascript 
    // 只设置text属性的值
    export function createTextVNode (val: string | number) {
      return new VNode(undefined, undefined, undefined, String(val))
    }
  ```
  3. 克隆节点
  ``` javascript 
    // clone节点 ，就是用被clone节点的数据 创建一个新的vNode对象
    // 然后实例的isClone设置成true
    export function cloneVNode (vnode: VNode): VNode {
      const cloned = new VNode(
        vnode.tag,
        vnode.data,
        // 深拷贝
        vnode.children && vnode.children.slice(),
        vnode.text,
        vnode.elm,
        vnode.context,
        vnode.componentOptions,
        vnode.asyncFactory
      )
      cloned.ns = vnode.ns
      cloned.isStatic = vnode.isStatic
      cloned.key = vnode.key
      cloned.isComment = vnode.isComment
      cloned.fnContext = vnode.fnContext
      cloned.fnOptions = vnode.fnOptions
      cloned.fnScopeId = vnode.fnScopeId
      cloned.asyncMeta = vnode.asyncMeta
      cloned.isCloned = true
      return cloned
    }

  ```
  
  ## diff 算法的过程

  原则： 
  
    1. 使用vNode 更新oldNode  
    2. 同级比较，不跨级比较
    2. 能不移动就不移动
    3. 能不创建就不创建
    4. 最后实在不行的话 才创建
