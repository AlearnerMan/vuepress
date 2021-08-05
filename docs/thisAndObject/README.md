
# 对JavaScript中this和原型的理解
  书接上篇：[《对Javascript中作用域和闭包的理解》](https://juejin.cn/post/6982074094623653924)。本篇文章也是对《你不知道的JavaScript》（上）中关于this和原型的理解和总结。  

  仅仅是简单的读完书中的知识远远是不够的，更多的是需要应用到我们日常的代码编写当中，**学习不应该只是停留在知道和理解的阶段，更重要的是反馈和应用**。所以输出这篇书中知识的总结，也当作一篇笔记留给以后的自己看。
  废话不多说下面开始关于this和原型的讲解：
  
  ## this

  说起this这个东西（暂时称为东西...）,前端开发同学应该都不陌生，总是能说上两句（因为这应该是面试必问的知识点），但是如果详细把this的知识说清楚的话，好像又不是那么明白，别慌，下面我们来一步步揭开盖在this上面神秘的面纱
  ### WHAT？
  嗯... 时髦一点，用个英文来当标题 😏  ，其实意思就是this到底是什么
  #### 理解误区
  首先来说明两个关于this的理解误区：  

  1. **this指的就是当前的函数**  
  使用书中的一个示例来反驳这个观点：
  ```javascript
  /*
    我们想要来记录一下函数被调用的次数
  */
   function foo(){
       console.log('foo被调用'+ ++this.count +'次')
   }
   // 初始化count 
   foo.count = 0
   // 第一次调用
   foo() // foo被调用NaN次  why????
  ```
  我们来看上面的例子，如果this指向的是foo的话，那么应该输出的是：**foo被调用1次**，但实际输出的确是：**foo被调用NaN次**，由此可见this不是指向当前的函数的。  

  但是为什么会输出这个呢？在这里卖个关子，下面this的绑定规则看完之后你就会明白为什么，可以在评论区留下你的理解。  

  当然看过上一篇的同学可能会机智的指出我只需要定义一个变量来存储count，利用上一篇学的词法作用域的知识就可以实现想要的功能了，是的，可以的，但这跟我们讲this没有啥关系，就不在这里贴代码了。

  2. **this指的是函数的作用域（不理解作用域的同学自己去看上一篇文章）**    
  这个说法不能说完全不对只能说这只是一种简单的情况，同样还是可以通过一个例子来说明一下：
  ```javascript
  function foo(){
     var a = 0
     console.log(this.a)
  }
  foo() // undefined  why???
  ```
  看上面的代码，如果this指向的是foo函数的作用域，那么a变量肯定是存在于foo的作用域中的，但实际上输出的是undefined  

  引用书中一句话：**在JavaScript内部，作用域确实和对象类似，可见的标识符都是他的属性，但是作用域‘对象’无法通过JavaScript代码访问（也就是说无法显式的赋值给一个标识符），它存在于JavaScript引擎内部（引擎可以隐式的让我们访问）**

  #### this到底是什么（完全照抄）
 
   this是在运行时进行绑定的，并不是在编写时绑定，他的上下文取决于函数调用时的各种条件，this的绑定和函数声明的位置没有任何关系，只取决于函数的调用方式  

   当一个函数被调用时，会创建一个活动记录（有时也会称为执行上下文）。这个记录会包含函数在哪里被调用/函数的调用方式，传入的参数等信息，this就是这个记录的一个属性，会在函数执行过程中用到

   也就是说，**this在函数定义的时候是啥，谁都不知道（那它跟词法作用域没得关系了），只有在函数调用的时候才知道this到底是谁（有可能是函数自己哦...）**




  ### this绑定规则
  上面我们只是简单的理解了一下this是什么以及说明了两个常见的误区，下面我们来具体说明一下当函数中出现this的时候不同的场景下，this指的到底是什么？也就是this的绑定规则  

  应该是有四个规则，其他的场景都是这几个规则的组合，下面我们来一一介绍这四个规则：默认绑定/隐式绑定/显式绑定/new绑定
  ### 默认绑定
  这个规则也是当无法应用其他规则时的默认规则：独立函数调用
  下面我们来通过一个例子来说明：
  ```javascript
  function foo(){
    console.log(this.a)
  }
  var a = 1
  foo() // 1
  ```
  上面例子中foo()没有任何修饰的函数引用调用的，所以是默认调用（就是说直接调用函数的时候一般就是默认调用，不管是在什么位置）

  ### 隐式绑定
  调用位置是否有上下文对象，或者说是否被某个对象拥有或者包含（是否是当作对象的属性来调用），此时这个this指向上下文对象或者某个对象
  同样还是看一个例子：
  ```javascript
   function foo(){
     console.log(this.a)
   }
   var obj = {
     a:2,
     foo:foo
   }
   obj.foo() // 2
  ```
  **通过obj.foo()调用方式调用的话，隐式绑定规则会把this绑定到obj上面**（具体到函数执行的上下文的话，感兴趣的同学可以自行查阅其他资料）
  ##### 隐式丢失
  一个很常见的问题就是隐式绑定时this丢失的问题：当我们函数当作参数传递时或者我们把对象方法重新赋值给其他变量在被调用时，都会出函数丢失绑定对象，这个时候会应用默认绑定规则，下面还是通过两个例子来看一下：
  ```javascript
  function foo(){
    console.log(this.a)
  }
  var obj = {
    a:1,
    foo:foo
  }
  var bar = obj.foo
  var a = 'global props'
  // 当我们重新赋值给bar的时候，会出现隐式绑定对象丢失的情况
  bar() // 'global props'  

  // 当被当做参数传递的时候也会发生隐式丢失的情况
  function doFoo(fn){
    fn() 
  }
  doFoo(obj.foo) // 'global props'
  ```



  ### 显式绑定
  如果我就想在一个对象上强制调用一个函数，而不是把这个函数赋值给这个对象的属性呢？js也给我们提供了这样的显式绑定的机制：call/apply/bind,下面来介绍一下这几个函数：
  #### call/apply方法
  把这两个函数放到一起来说，是因为他们两个区别就是传参的区别（所以为啥提供两个函数呢？），他们第一个参数都是你想要显式绑定的对象（如果是基础类型，会转换成对应的对象形式：string->String...）,call除了这个之外是一个参数列表，apply方法剩下的参数可以传递一个数组，会把数组中的参数传递给调用函数
  下面还是来举个例子来说明一下
  ```javascript
  function add(num1,num2){
    return this.basicNum + num1 + num2
  }
  var obj = {
    basicNum:1
  }

  add.call(obj,1,2) // 4

  add.apply(obj,[1,2]) // 4
  
  // 那如果apply传多于两个参数呢？会被忽略
  add.apply(obj,[1,2],3) // 4
  add.apply(obj,[1,2,3]) // 4
  add.apply(obj,[1]) // NaN => 1 + undefined = NaN
  add.apply(obj,1) // Uncaught TypeError: CreateListFromArrayLike called on non-object 报错了
  // 既然上面报错说不是一个对象，那如果传一个对象呢？
  dd.apply(obj,{}) // NaN  咱也不知道实际是怎么调用的。。。
  ```

  #### bind方法（硬绑定）
  上面我们说了两种显式绑定的方式，那为什么还会有bind方法呢？会想一下上一节说的绑定丢失的情况，有一种情况是把函数当作参数传递给其他的函数（常见的就是回调函数），这种情况下我们也不知道传给的目标函数是怎么调用我们的函数的，也就是说当函数调用的时候我们不知道this的指向到底是不是预期的对象，这种情况下我们应该怎么解决？这个时候就可以使用硬绑定的方式来实现：
  看一个书中的例子：
  ```javascript
  function foo(){
    console.log(this.a)
  }
  var obj = {
    a:1
  }
  var bar = function(){
    foo.call(obj)
  }
  bar() // 2
  setTimeout(bar,2000) // 2
  // 硬绑定的bar就不能在修改他的this了
  bar.call(window) // 2 

  ```

  通过上面的例子我们可以看到，**硬绑定的意思就是在这个函数外面在包裹一层**，上面的是绑定固定的对象，同样我们可以优化一下，写一个更通用的硬绑定的函数：  
  ```javascript
  // 实现一个更通用的硬绑定函数
  function bind (fn,target){
    return function (){
      return fn.apply(target,arguments)
    }
  }
  function foo(num){
    return this.a + num
  }
  var obj = {
    a:1
  }
  var bar = bind(foo,obj)

  var b = bar(1) // foo.call(obj,1)
  console.log(b) // 2
  ```
  由于硬绑定是一个非常常见的模式，所以ES5提供了内置的方法：Function.prototype.bind,用法跟上面的bind函数类似：
  ``` javascript
  
  function foo(){...}
  var obj = {...}

  var bar = foo.bind(obj)
   
  console.log(bar(1)) // 2

  ```
  ##### bind方法的其他用处
  看到这里的同学可能会有个疑问，bind方法除了第一个参数之外，还可以传递其他的参数吗？那传递之后有什么用处呢？
  其实bind函数调用的时候是可以类似call那样传递参数的，也就说除了绑定对象之外，可以传一个参数列表进来，当调用返回的新函数的时候这个参数列表会传给被硬绑定的函数去执行。
  
  举个例子来说明一下： 
  ``` javascript
  function add(num1=0,num2=0){
    return this.basicNum + num1 + num2
  }
  var obj = {basicNum:1}
  // 这个时候相当于 num1 = 1 
  var add_one = foo.bind(obj,1)
  // num2 = 2
  add_one(2) // 1+1+2
  ```
  ok,这个特点我们已经知道了 那它具体有什么用处呢？
  比如说我们有一个给DOM节点绑定事件的工厂函数：
  ```javascript
  function domBindEvent(dom,fn_type,fn){
    dom.addEventListener(even_type,fn)
  }
  ```
  这种情况下当给不同dom绑定不同事件的时候可以使用bind的这个特性：
  ```javascript
  const div = document.getElementById('id')
  const eventInfo = {
    'click':function(){...},
    'hover':function(){...}
  } 
  // 此时可以生成一个针对div的绑定函数，然后把event_type和fn传进去
  var divBindFn = domBindEvent.bind(null,div)
  for(let type in eventInfo){
    divBindFn(type,eventInfo[type])
  }
  ```
  #### API调用的‘上下文’
  第三方的许多函数，以及JavaScript语言和宿主环境中许多新的内置函数，都提供了一个可选的参数，通常被称为上下文（context），作用和bind一样的  
  同样举例来说：
  ```javascript
  function foo(el){
    console.log(el,this.id)
  }
  var obj = {id:"awesome"}

  [1,2,3].forEach(foo,obj) // 1 awesome 2 awesome 3 awesome 
  ```
  总结一下，我们关于显式绑定的东西都已经说完了，比较杂，主要就是使用call/apply/bind函数来实现显式绑定，也详细讲解了这三个函数的用法。
  ### new绑定
  最后我们来看一下这个new绑定方式，当函数当作构造函数调用时，this会指向新生成的对象：
  同样还是举个例子来说明一下：
  ``` javascript 
  function Foo(a){
    this.a = a 
  }
  var bar = new Foo(2)
  console.log(bar.a) // 2
  ```
  在这里我们来补充一下new操作符实际干了什么事情，也就是说当我们使用new来调用函数，或者说发生构造函数调用时，会发生什么：  
  1. 创建一个新对象
  2. 这个新对象会被执行【prototype】链接（obj.__proto__ = Foo.ptototype）
  3. 这个新对象会绑定到函数的this
  4. 如果函数没有返回其他对象（注意：如果返回基础类型，会被忽略），那么new表达式中的函数调用会自动返回这个新对象
  这个就是new Foo()时发生的事情，后面我们会继续讲关于JavaScript中构造函数的细节，这个地方就不再赘述了。


  上面就是this绑定的四种规则，我们都一一讲解过了，更复杂的场景就是上面四种绑定规则的同时应用，所以下面我们来看一下这几个规则绑定的优先级，也就是说当函数同时应用这几个绑定规则时，this到底时通过什么样的规则来实现绑定的




  ### 规则优先级
  **首先默认规则应该是优先级最低的，因为其他规则应用不上时候都是应用的默认规则**  
  然后我们来看一下其他几种规则的优先级：
  #### 隐式绑定 PK 显式绑定
  显式绑定比隐式绑定的优先级高，同样我们还是通过一段代码来说明：  
  ```javascript
  function foo(){
    console.log(this.a)
  }

  var obj1 = {
    a:1,
    foo:foo
  }

  var obj2 = {
    a:2
    foo:foo
  }
  // 隐式绑定
  obj1.foo() // 1
  obj2.foo() // 2
  // 显式绑定 > 隐式绑定
  obj1.foo.call(obj2) // 2
  obj2.foo.call(obj1) // 3

```
 看完上面的例子有的同学可能会说 obj1.foo.call(obj2) 实际应该就是foo.call(obj2)吧？因为代码执行顺序的原因所以foo函数绑定的this是obj2（也可能只有我自己有这个疑问😄），那下面我们来调换一下调用顺序：  

 ```javascript
  var bindFoo = foo.bind(obj2)
  var obj3 = {
    a:3,
    foo: bindFoo
  }
  obj3.foo() // ? 实际输出的是2

  ```
  通过上面两个例子 好像显式绑定就是比隐式绑定的优先级更高(也可能是上面讲的bind方法绑定之后this就不能修改导致)，当然也可以想想，你都专门绑定了，肯定是覆盖隐式的绑定规则的。

  #### new绑定 PK 隐式绑定
  下面我们再来分析一下new绑定和隐式绑定的优先级，话不多说，看代码：  

  ```javascript
  var foo = function(props){this.a = props}
  var obj1 = {foo:foo}
  var obj2 = {}
  // 这个就是隐式绑定
  obj1.foo(1) 
  console.log(obj1.a) // 1
  
  // 显式绑定比隐式绑定优先级高
  obj1.foo.call(obj2,2)
  console.log(obj2.a) // 2

  // new绑定比隐式绑定优先级高
  var bar = new obj1.foo(3)
  console.log(bar.a) // 3
  console.log(obj1.a) //1

  ```
  通过上面的例子我们可以看出来，new绑定优先级是比隐式绑定的优先级更高的

  #### new绑定 PK bind绑定

   因为call/apply使用之后函数就直接执行了，没有办法在当作构造函数被调用，所以我们使用bind绑定来跟new绑定比较优先级：
   同样还是看一段代码来看一下优先级是怎样的：  
   ```javascript
   function foo(something){
     this.a = something
   }
   var obj = {}
   var bar = foo.bind(obj)
   bar(1) 
   console.log(obj.a) // 1

   var baz = new bar(3)
   console.log(obj.a) // 1
   // 看一下 这个的话说明new绑定优先级更高
   console.log(baz.a) // 3 

   ```
  #### 总结

  通过上面的代码我们大致知道了优先级的顺序：**new绑定 > 显式绑定 > 隐式绑定 > 默认绑定**
  
  
  ## 对象
  这个地方我们来讲一下JavaScript中的对象，首先说明一下为什么讲的是原型和this，却还要讲一下对象这个呢？因为不管是理解this的指向还是原型，都离不开对象的使用，所以我们这个地方来详细的讲一下JavaScript中的对象到底是什么：

  ### 语法
  先从简单的讲起，对象定义的两种形式：声明(文字)形式和构造形式

  1. 声明(文字)形式
  ```javascript
  var obj = {
    key:value,
    ...
  }
  ```
  2. 构造形式
  ```javascript
  var obj = new Object()
  obj.key = value
  ```
  两种形式生成的对象都是一样的，区别就是声明(文字)形式的话可以一次声明多个属性，而构造形式需要一个一个添加
  ### 类型
  JavaScript中一共有6中主要类型：
  + string
  + number
  + boolean
  + null
  + undefined
  + Object

  通过上面的分类我们可以看出来，简单基本类型不是对象（JavaScript中一切皆是对象？）
  
  当然除了这几个主要类型，JavaScript中还有许多特殊的对象子类型，可以称之为**复杂基础类型**  
  例如：Function/Array,所以可以像操作对象一样操作函数或者数组，比如给他们添加属性值等

  #### 内置对象
  还有一些对象子类型，通常被称为内置对象：
  + String
  + Number
  + Boolean
  + Object
  + Function
  + Array
  + Date 
  + RegExp
  + Error
  在JavaScript中，他们实际上是一些内置函数，这些诶之函数可以当做构造函数使用，下面我们来主要看一下String/Number/Boolean这几个内置对象，因为他们跟我们前面说的基础类型很类似，但实际上他们更加复杂，同样的是我们还是来用代码来说明一下：
  ```javascript 
  var str = 'I am a string'
  typeof str // 'string' 基础类型
  str instanceof String // false  
  var strObj = new String('I am a String')
  typeof strObj // 'Object'
  strObj instanceof String // true
  ```
  通过上面的例子我们可以看出来这两个是不同的类型，而且String是Object的子类型，那提供这个内置对象是有什么用处呢？为什么要提供这些基础类型对应的对象类型呢？下面我们来思考一下下面这段代码：  
  ```javascript 
  var str = 'I am a string'
  console.log(str.length) // 13
  console.log(str.charAt(3)) // 'm'
  ```
  不知道同学们发现没有如果我们给一个string类型的变量绑定一个属性的话是不会生效的： 
  ```javascript 
  var str = 'I am a string'
  str.key = 'error' // 不会报错
  console.log(str.key) // undefined
  ```
  通过上面两个例子的说明，有的同学可能已经猜到了，正常来说string类型的数据只是一个字面量，并且是一个不可变的值，如果要在一个字面量上执行一些操作怎么办呢？那就把他转换成对应的对象类型String形式，然后就可以执行一些操作了。
  像上面我们直接访问str.length的话 实际上引擎会帮我们把string转换成对应的String类型，调用完成后在把String类型的对象销毁掉，所以我们可以在代码中直接使用这些方法不会报错，因为这些方法都是绑定在String.prototype上面的(通过原型链我们可以访问到，后面会讲到)
  
  ### 内容（属性）
  上面我们说明了对象的声明方式和类型，下面我们来讲一下对象是干啥的？我感觉对象可以理解为一个存储数据的数据结构，
  这个数据结构通过一个类似指针的方式来指向对应的数据的存储位置，从而把多个数据有序的联系在一起。

  也就是说，对象中存储的值实际上不是放在对象的内部的，在引擎内部，这些值得存储方式是多种多样的，而存储在对象这个容器中的只是这些属性的名称（类似指针或者说是一个引用），指向这些值得真正的存储位置。
  
  #### 访问方式
  访问对象中的值有两种方式：.操作符和[]操作符，这两个的区别就是.操作符要求属性名满足标识符的命名规范，而[]操作符可以接受任意的UTF-8/Unicode字符串作为属性名（具体啥意思咱也不太清楚，理解下来就是不符合我们常用的命名规范的属性值都可以通过这种方式来访问），**说了这么多，感觉我们需要知道[]操作符中可以使用一个变量来访问值**，举个例子看一下：

  ```javascript
  var obj = {
    'foo':'I am Foo'
  },

  var fooStr = 'foo'

  console.log(obj[fooStr]) // I am Foo 
  ```
  **ES6中支持我们在[]中使用表达式**
  ```javascript
  var preStr = 'f'
  var obj = {
    [preStr+'00'] : 'I am Foo'
  }
  ```
  
  #### 属性描述符
  属性描述符就是用来描述对象属性的特性的，有三个：writable（可写）、enumerable（可枚举）、configurable（可配置）

  可以使用Object.getOwnPropertyDescriptor(object,key)方法来拿到属性描述符,设置属性描述符的话可以使用Object.defineProperty(object,key,porpsConfig),下面我们还是来通过一段代码来具体说一下：  
  ```javascript
  var obj = {}
  
  Object.defineProperty(obj,'a',{
    value:2,
    writable:true,
    configurable:true,
    enumable:true
  })
  // 获取属性描述符
  Object.getOwnPropertyDescriptor(obj,'a') //{value: 2, writable: true, enumerable: false, configurable: true} 
  
  
  obj.b = 3
  // 获取默认的属性描述符
  Object.getOwnPropertyDescriptor(obj,'b') // {value: 3, writable: true, enumerable: true, configurable: true}
  ```


  上面我们来具体说明一下每个属性代表的什么意思：
  1. writable（可写）
  writable决定是否可以修改属性的值
  ```javascript
  var obj = {}

  Object.defineProperty(obj,'a',{
    value:2,
    wirtable:false, // 不可修改
    enumerable: true,
    configurable:true,
  })
  console.log(obj.a) // 2
  obj.a = 3 
  console.log(obj.a) // 2  也就是我们的赋值操作静默失败，如果是严格模式会直接报错：TypeError错误，表示我们无法修改一个不可写的属性
  ```

  
  2. enumerable
  这个属性描述符控制的是属性是否会出现在对象的属性枚举中，比如for...in循环等。如果值为false，就不会出现循环中，但是值仍然可以正常的访问
  


  3. configurable
  只要属性是可配置的，我们就可以使用defineProperty()方法来修改属性的描述符：
  ``` javascript
  var obj = {}

  obj.a = 2 

  Object.defineProperty(obj,'a',{
    value:3,
    configurable:false, // 不可配置
    enumerable: true,
    wirtable:true
  })
  
  console.log(obj.a) // 3
  
  // 在尝试使用defineProperty修改属性描述符的话会报TypeError错误，所以configurable：false是单向的，无法撤销
  Object.defineProperty(obj,'a',{  // TypeError
    value:4,
    configurable:true,
    writable: true,
    enumerable:true
  })

  ```
  除此之外，如果属性的configurable为false的话也不能使用delete操作符删除该属性

  ##### 应用
  我们讲完了上面的属性描述符之后，可以用这几个特性来定义一些特殊的对象，来满足我们不同的要求
  1. **对象常量**
  结合writable：false和configurable：false就可以创建一个对象常量（不可修改，重定义和删除）：
  ```javascript
  var obj = {}

  Object.defineProperty(obj,'FAVORITE_NUMBER',{
    value:2,
    wriable:false,
    configurable:false
  })
  ```
  2. **禁止扩展**
  如果想要禁止一个对象添加新属性并且保留已有的属性，可以使用Object.preventExtensions()方法：
  ```javascript
  var obj = {
    a:2
  }
  Object.preventExtensions(obj)
  
  obj.b = 3 

  console.log(obj.b) // undefined
  ```

  3. **密封**
  Object.seal()会创建一个 密封的对象，这个 方式实际上会在一个现有对象上调用Object.preventExtensions()并把现有所有属性标记为configurable：false，

  所以密封之后的对象不仅**不能添加新属性，也不能重新配置或者删除任何现有属性（但是可以修改属性的值）**

  4. **冻结**
  Object.freeze()会创建一个冻结对象，这个实际上会在一个现有对象上调用Object.seal()并把所有数据访问属性标记为writable：false,这样就无法修改他们的值
  
  他会禁止对对象本身以及其任意直接属性的修改（这个对象引用的其他对象是不受影响的）
  
  #### 访问描述符

  1. [[Get]]
  当我们访问对象的属性时，实际上就是执行的[[Get]]操作，这个操作首先会在对象内部查找有没有这个属性，如果没有的话会继续查找该对象的原型链上有没有该属性，如果都没有的话返回undefined，下面我们还是来看一段代码：

  ``` javascript
  var obj = {
    a:undefined
  }
  console.log(obj.a) // undefined
  console.log(obj.b) // undefined
  ```
  上面两个虽然输出结果一样的，但是[[Get]]操作是不是一样的，obj.a 是在对象中找到了这个属性，这个属性值为undefined。obj.b是在对象中没有找到，然后又去原型链中也没有找到，所以返回了undefined。

  
  2. [[Put]]
  这个操作跟我们刚才讲的[[Get]]操作相对应，就是赋值操作，但是会更加复杂一点，大致就分为两种情况：一种是对象存在这个属性，一种是不存在这个属性，并且[[Put]]也不是一个简单的赋值操作，还需要结合我们前面讲的属性描述符和访问描述符来执行赋值的操作：

  + 对象中已经存在该属性：

    首先检查属性是否是访问描述符，如果是就调用setter方法
    然后检查属性的数据访问符中writable是否为false，是的话严格模式抛出错误，非严格模式静默失败
    如果不是以上两种场景，则将该值赋值为属性的值
  
  + 对象中不存在该属性：
    这个场景更加复杂，我们在后面的原型链中会继续讲到，这个地方先知道一下就好了。
    
  3. getter/setter
  对象的[[Get]]和[[Put]]操作分别可以控制属性值得获取和设置
  js也给我们提供了修改属性访问和设置的默认操作的方式：getter/setter，这两个都是函数，getter是在属性被访问的时候调用，setter是在设置对象属性值得时候被调用。
  当我们给一个属性定义getter、setter或者两个都有时，这个属性会被定义为**访问描述符**。对于访问描述符来说，会忽略他的value和writable属性，关注他的get和set方法：
  ```javascript
  var obj = {
    get a(){
      return 2
    }
  }

  Object.defineProperty(obj,'b',{
    get:function(){
      return this.a * 2
    },
    enumerable:true
  })
  console.log(obj.a) // 2
  console.log(obj.b) // 4

  // 如果重新给a/b赋值的话 因为没有set方法，会静默失败
  obj.a = 4
  console.log(obj.a) // 2
  ```
  由于上面我们只是定义了属性a的getter方法，所以对属性a的赋值操作会静默失败，
  下面我们来定义一下属性a的setter方法：
  ```javascript
  var obj = {
   b:2,
   get a(){
     return this.b
   },
   set a(val){
     this.b = val *2
   }

  }
  obj.a = 2 
  console.log(obj.a) //4
  console.log(obj.b) // 4
  ```
  ### 总结
  我们上面详细讲了JavaScript中的对象是什么以及对象声明以及他的一些特性，所以 **JavaScript中一切皆是对象？？**


  ## 原型




  




 