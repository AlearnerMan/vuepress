# VUE源码解析--数据监听原理
  提到Vue大部分人能想到的就是数据驱动视图更新。其中最主要的就是要监听数据的变化，从而更新依赖该数据的视图，那下面我们就通过源码来看一下Vue是如何监听数据变化的。

  > 推荐查看GitHub上的[Vue源码](https://github.com/vuejs/vue)工程

  > 不推荐直接查看打包后的vue.js文件: 没有区分模块,所有的代码放到一起，不利于我们理解Vue的设计原理
  
  
  Vue中监听数据变化的方式可以分为两种：Object.defineProperty(对象)、改写原型链的方法push/pop/shift/unshift/splice/sort/reverse(数组)

  好了，看到这的话就应该已经了解Vue中数据监听的原理了

  下面我们来结合代码逐一介绍具体的实现细节：
  ``` javascript
  // 代码路径： src/core/observer/index.js
  /**
    Observer类依赖于被观察的对象。
    当创建一个Observer实例后，观察者会给每一个目标对象增加getter(增加依赖)/setter(更新视图)
 */
  export class Observer {
    value: any;
    dep: Dep;
    vmCount: number; 

    constructor (value: any) {
      this.value = value
      // 目标对象的依赖
      this.dep = new Dep()
      this.vmCount = 0
      /**
        //def 给对象定义一个属性
        function def (obj: Object, key: string, val: any, enumerable?: boolean) {
          Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
          })
        }
        给目标对象增加__ob__属性，避免多次绑定
      **/
      def(value, '__ob__', this)
      if (Array.isArray(value)) {
        /**
          // 是否支持__proto__
          const hasProto = '__proto__' in {}
        **/ 
        if (hasProto) {
          protoAugment(value, arrayMethods)
        } else {
          copyAugment(value, arrayMethods, arrayKeys)
        }
        this.observeArray(value)
      } else {
        this.walk(value)
      }
    }

    /**
      Walk会遍历所有的属性给他们增加getter/setter方法
    */
    walk (obj: Object) {
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i])
      }
    }

    /**
    * Observe a list of Array items.
    */
    observeArray (items: Array<any>) {
      for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i])
      }
    }
  }
  ``` 
   ## Object.defineProperty实现数据监听
      
  上面我们看到如果是对象的话调用walk方法，walk中获取对象的keys然后遍历调用defineReactive方法：

  defineReactive方法中给对象的属性绑定getter/setter方法，在getter中收集依赖，然后在setter中通知依赖去更新视图

  <!-- > 依赖：指的是Wathcher类，现在还不需要关注细节，只需要知道就好了，后面会详细讲解，现在只是理解
  > 这里用一个Dep类来存储每一个依赖 -->

  ``` javascript
  export function defineReactive (
    obj: Object,
    key: string,
    val: any,
    customSetter?: ?Function,
    shallow?: boolean
  ) {
    // 用于存储依赖的数据结构
    const dep = new Dep()
    ...

    //如果value值还是对象的话  继续监听，递归调用实现深层监听
    let childOb = !shallow && observe(val)
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        const value = getter ? getter.call(obj) : val
        if (Dep.target) {
          // 收集依赖
          dep.depend() 
          if (childOb) {
            // 子属性收集依赖
            childOb.dep.depend()
            if (Array.isArray(value)) {
              dependArray(value)
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) {
        const value = getter ? getter.call(obj) : val
        /* eslint-disable no-self-compare */
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        ...
        // 有getter没有setter 直接返回
        if (getter && !setter) return
        if (setter) {
          // 有setter函数就执行
          setter.call(obj, newVal)
        } else {
          val = newVal
        }
        childOb = !shallow && observe(newVal)
        // 这里去更新视图
        dep.notify()
      }
    })
  }
```


## 改写原型链的方法push/pop/shift/unshift/splice/sort/reverse实现数据监听

  如果value值是数组的话，判断是否支持通过__proto__属性来改变属性的原型，支持的话就赋值为重写后的原型方法， 不支持的话就给value直接绑定几个原型方法，然后遍历数组中的每一项 给他们生成对应的Observer实例。

  也就是说如果value值为数组的话 在几个原型方法中通知依赖去更新视图，但是在什么地方给数组添加依赖的呢？？？

  答案就是在给对象绑定依赖的时候还会遍历对象的属性然后给属性添加依赖，因为我们正常访问数组都是定义为对象的属性，这样通过递归对象的属性从而给数组添加了依赖。


  ``` javascript
  // arrayMethods 以Array.prototype为原型的对象,重新定义了标题所说的几个原型方法
  /*
    const arrayProto = Array.prototype
    export const arrayMethods = Object.create(arrayProto)
  */
  const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

  // Observer中的constructor中的逻辑
  if (Array.isArray(value)) {
    if (hasProto) {
      protoAugment(value, arrayMethods)
    } else {
      copyAugment(value, arrayMethods, arrayKeys)
    }
    this.observeArray(value)
  }


  // 设置value的_proto_为arrayMethods
  function protoAugment (target, src: Object) {
    target.__proto__ = src
  }
  // 不支持通过__proto__来改变原型指向的话 给每一个value值单独绑定标题所说的几个原型方法
  function copyAugment (target: Object, src: Object, keys: Array<string>) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i]
      def(target, key, src[key])
    }
  }

  // 遍历数组中的元素 调用observe
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
  // observe方法 返回一个Observer对象
  function observe (value: any, asRootData: ?boolean): Observer | void {
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    let ob: Observer | void
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__
    } else if (
      shouldObserve &&
      !isServerRendering() &&
      (Array.isArray(value) || isPlainObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      ob = new Observer(value)
    }
    if (asRootData && ob) {
      ob.vmCount++
    }
    return ob
  }
  ```

  ## 思考
  1. 应该用什么样的数据结构来存储依赖呢？

  2. 我们说了这么多依赖，那依赖到底指的是什么？

  3. 操作数组下标和直接给数组length赋值为什么不能更新视图？

  3. Vue3中为什么放弃了这种数据监听模式，而使用了Proxy的方式？

  # Watcher