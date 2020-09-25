# VUE源码解析--依赖存储结构（Dep类）
  上一篇[VUE源码解析--数据监听原理](https://juejin.im/post/5ee0a51ce51d45788d1cd038)中有几个思考问题，现在我们来解答一下第一个问题：

  ## 应该用什么样的数据结构来存储依赖呢？
  vue中使用Dep类来存储依赖，对外暴露了增加、删除、更新等方法，下面来结合代码来具体讲解每个方法

  ``` javascript
    /*
      // src/shared/util.js 中定义的remove方法
      function remove (arr: Array<any>, item: any): Array<any> | void {
        if (arr.length) {
          const index = arr.indexOf(item)
          if (index > -1) {
            return arr.splice(index, 1)
          }
        }
      }
    
    */

    export default class Dep {
      // 静态变量，用于存储当前需要被添加到subs中的依赖（Watcher实例）
      static target: ?Watcher;
      // 唯一标识
      id: number;
      // 用于存储依赖（Watcher实例）的数组
      subs: Array<Watcher>;

      constructor () {
        this.id = uid++
        this.subs = []
      }
      // 很简单 不多说
      addSub (sub: Watcher) {
        this.subs.push(sub)
      }

      removeSub (sub: Watcher) {
        // (方法定义请看最上面的注释)调用Array的splice方法删除数组中对应下标的item
        remove(this.subs, sub)
      }

      // 这个方法是在getter方法中收集依赖时调用的方法
      // Dep.target --> new Watcher()对象， 
      depend () {
        // Dep.target 指的是 当前Watcher实例
        if (Dep.target) {
          // 调用的是new Watcher对象的addDep方法  （watcher.js）
          // addDep 是再把new Watcher对象添加到Dep实例中的subs属性中
          Dep.target.addDep(this)
        }
      }
      // 该方法遍历Dep实例中的subs，然后执行Watcher实例的update方法 来更新视图
      notify () {
        // stabilize the subscriber list first
        const subs = this.subs.slice()
        if (process.env.NODE_ENV !== 'production' && !config.async) {
          subs.sort((a, b) => a.id - b.id)
        }
        for (let i = 0, l = subs.length; i < l; i++) {
          subs[i].update()
        }
      }
    }
    // 一个给Dep.target赋值，一个删除  在Watcher中的get方法中调用
    Dep.target = null
    const targetStack = []

    export function pushTarget (target: ?Watcher) {
      targetStack.push(target)
      Dep.target = target
    }

    export function popTarget () {
      targetStack.pop()
      Dep.target = targetStack[targetStack.length - 1]
    }
  ``` 
  ## 简单的画个流程图
  ![流程图](https://user-gold-cdn.xitu.io/2020/7/7/173285a4d13dd983?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

  