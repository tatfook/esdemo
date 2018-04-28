# esdemo

> Nuxt.js project

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install*[see note below]

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

*Note: Due to a bug in yarn's engine version detection code if you are
using a prerelease version of Node (i.e. v7.6.0-rc.1) you will need to either:
  1. Use `npm install`
  2. Run `yarn` with a standard release of Node and then switch back

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).


## 使用说明
1. 登录账号为stage.keepwork.com账号
2. 图片上传为七牛上传示例
3. 数据保存为git文件提交示例
4. 程序流程: 页面进入=>获取demo站点信息 没有创建=>获取该站点的数据源信息=>填写表单=>提交git数据=>git callback提交ES数据=>查询ES数据
