
 // 用于访问内置插件，如热更新
const webpack = require('webpack') 
module.exports = {
    title:null,
    description:'Just playing around',
    configureWebpack:{
        resolve:{
            alias:{
                '@':'docs/public'
            }
        },
        plugins:[
            new webpack.HotModuleReplacementPlugin() 
        ]
    },
    chainWebpack: (config, isServer) => {
        // config 是 ChainableConfig 的一个实例
    }
}