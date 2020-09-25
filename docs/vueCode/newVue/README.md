# VUE源码解析 -- 准备工作
  前段时间看了Vue的源码，但是总感觉晕晕乎乎的，整体流程总是串不起来，于是想到了从new Vue()开始一步步的看看到底都发生了什么事情，废话不多说，下面一起来探索一下

 ## 准备工作
 1. 下载[Vue源码](https://github.com/vuejs/vue)
 2. 准备一个支持Vue的前端工程脚手架，可以使用上篇文章中[webpack搭建项目](https://juejin.im/post/6870312297055649800)的工程（如果不想自己搭建的话，可以直接私信我，就不放GitHub上地址了）
 3. 把Vue源码中的src目录拷贝到自己的脚手架，目的是可以直接引用Vue对象
 4. 运行项目，new Vue()可以正常运行

 上面所说的其实就是把vue源码当做一个插件，添加到我们的项目中来，这样的话我们就可以随意调试，来查看整体的流程
 工程目录如下：
 ![工程目录](./assets/project1.png)


  按照上面做完之后，运行项目应该会出现以下报错，但是不要慌，我们一个一个来解决

  1. vm.$mount is not a function 
  ![$mounterror](./assets/error1.png)
  这个报错是因为我引用Vue对象的时候引用的是core/index.js中的Vue，此时的Vue不包含$mount方法  
  解决思路：  
  我们知道Vue构建版本包括：完整版（编译器+运行时）和运行时  
  我们使用Vue对象的时候需要包括编译器的，因为我们要查看代码中编译模板的过程，因此我们可以查看一下Vue源码中构建的入口，这样我们就知道我们应该引用哪个文件才包含Vue完整的功能，Vue构建是在源码中的script/config.js中定义了各种版本的构建开始入口：
  ``` javascript
  // script/config.js 部分代码 
  const builds = {
    // Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
    'web-runtime-cjs-dev': {
      entry: resolve('web/entry-runtime.js'),
      dest: resolve('dist/vue.runtime.common.dev.js'),
      format: 'cjs',
      env: 'development',
      banner
    },
    'web-runtime-cjs-prod': {
      entry: resolve('web/entry-runtime.js'),
      dest: resolve('dist/vue.runtime.common.prod.js'),
      format: 'cjs',
      env: 'production',
      banner
    },
    // Runtime+compiler CommonJS build (CommonJS)
    'web-full-cjs-dev': {
      entry: resolve('web/entry-runtime-with-compiler.js'),
      dest: resolve('dist/vue.common.dev.js'),
      format: 'cjs',
      env: 'development',
      alias: { he: './entity-decoder' },
      banner
    },
    'web-full-cjs-prod': {
      entry: resolve('web/entry-runtime-with-compiler.js'),
      dest: resolve('dist/vue.common.prod.js'),
      format: 'cjs',
      env: 'production',
      alias: { he: './entity-decoder' },
      banner
    },
    ...
  }


  ```
  通过上面的entry选项我们可以看到不同版本的入口文件是什么，然后我们找到对应的文件，然后引用对应的文件就可以得到不同的Vue，我们完整版的Vue应该是在web/entry-runtime-with-compiler.js，因此我们使用Vue对象的时候直接引用这个文件中的Vue对象就好了
  ![importVue](./assets/import1.png)

  2. Vue源码中引用文件路径不正确  
  ![error2](./assets/error2.png)  
  这个是因为我们直接把源码拷过来了，对应的路径不正确，只需要我们做个映射就好了（可以看到Vue源码里面也做了映射）
  
  ``` javascript
  // Vue源码中 script/alias.js 
  const path = require('path')

  const resolve = p => path.resolve(__dirname, '../', p)

  module.exports = {
    vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
    compiler: resolve('src/compiler'),
    core: resolve('src/core'),
    shared: resolve('src/shared'),
    web: resolve('src/platforms/web'),
    weex: resolve('src/platforms/weex'),
    server: resolve('src/server'),
    sfc: resolve('src/sfc')
  }
  

  // 在我们自己的工程里面同样做个映射
  // 也就是设置别名： resolve的alias选项
  resolve:{
        alias:{
            "@vue": path.resolve(__dirname,"../src/components/vue"),
            vue: path.resolve(__dirname,'../src/components/vue/platforms/web/entry-runtime-with-compiler'),
            compiler: path.resolve(__dirname,'../src/components/vue/compiler'),
            core: path.resolve(__dirname,'../src/components/vue/core'),
            shared: path.resolve(__dirname,'../src/components/vue/shared'),
            web: path.resolve(__dirname,'../src/components/vue/platforms/web'),
            weex: path.resolve(__dirname,'../src/components/vue/platforms/weex'),
            server: path.resolve(__dirname,'../src/components/vue/server'),
            sfc: path.resolve(__dirname,'../src/components/vue/sfc')
        }
    },
  ```

  这样我们就不需要修改我们的结构和源码就可以正常运行起来了    

  OK, 这是我遇到的两个问题，解决之后工程就可以正常的使用了  
  
  下面我们就可以发挥程序员调试的本领来尽情的发挥了

  ## 下期预告： new Vue() 都干了啥

  在讲new Vue()干了啥之前，我们先看一下在引入Vue对象的时候发生了什么。

  我们知道import执行的时候 对应的文件代码会执行，在这个过程中给Vue绑定了很多我们后面会用到的方法和属性，所有在这里有必要说明一下：  
  我们先看一下引用关系，

  










  