import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

import Icons from 'unplugin-icons/vite'
// icon自动引入解析器
import IconsResolver from 'unplugin-icons/resolver'

import postcsspxtoviewport from 'postcss-px-to-viewport-8-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [
        VantResolver(),
        IconsResolver({
          // 自动引入的Icon组件统一前缀，默认为icon，设置为false时表示不需要前缀
          prefix: 'icon',
          // 当图标集名称过长时，可使用集合别名
          alias: {
            system: 'system-uicons'
          }
        })
      ]
    }),
    Icons({
      compiler: 'vue3',
      // 自动安装图标集
      autoInstall: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    postcss: {
      plugins: [
        postcsspxtoviewport({
          unitToConvert: 'px',
          // vant组件默认视图宽度是375，按需调整为实际设计稿大小
          viewportWidth: file => file.indexOf('van') > 0 ? 375 : 750, 
          // viewportWidth: 750,
          // 单位转换后保留的精度
          unitPrecision: 5,
          // 能转化为vw的属性列表
          propList: ['*'],
          // 希望使用的视图单位
          viewportUnit: 'vw', 
          // 字体使用的视口单位
          fontViewportUnit: 'vw', 
          // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
          selectorBlackList: ['ignore-'], 
           // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
          minPixelValue: 1,
          // 媒体查询里的单位是否需要转换单位
          mediaQuery: true, 
          // 是否直接更换属性值，而不添加备用属性
          replace: true, 
           // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
          exclude: [],
          // 如果设置了include，那将只有匹配到的文件才会被转换
          include: [], 
          // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
          landscape: false, 
          // 横屏时使用的单位
          landscapeUnit: 'vw', 
          // 横屏时使用的视口宽度
          landscapeWidth: 1628, 
        })
      ]
    }
  }
})
