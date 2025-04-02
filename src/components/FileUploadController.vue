<!--
 * @description: 文件上传控制组件
 * @fileName: FileUploadController.vue 
 * @author: feng 
 * @date: 2025-04-02 08:19:56 
!-->
<template>
  <div class="container">
    <div class="firstContainer">
      <div class="fileName">文件名称</div>
      <div class="operatePanel">
        <van-button size="mini" title="暂停" @click="puaseUpload" v-if="isUpload && !isStop">
          <template #icon>
            <icon-codicon-debug-pause class="iconify"></icon-codicon-debug-pause>
          </template>
        </van-button>
        <van-button size="mini" title="开始" @click="startUpload" v-if="isPause && !isStop || isInit">
          <template #icon>
            <icon-codicon-debug-start class="iconify"></icon-codicon-debug-start>
          </template>
        </van-button>
        <van-button size="mini" title="停止" @click="stopUpload" v-if="isUpload || isPause">
          <template #icon>
            <icon-codicon-debug-stop class="iconify"></icon-codicon-debug-stop>
          </template>
        </van-button>
        <van-button size="mini" title="重新开始" @click="restartUpload" v-if="isStop">
          <template #icon>
            <icon-codicon-debug-restart class="iconify"></icon-codicon-debug-restart>
          </template>
        </van-button>
      </div>
    </div>
    <div class="progressDiv">
      <van-progress></van-progress>
    </div>
  </div>
</template>
<script setup lang="ts">
  import {ref, computed} from 'vue'

  defineOptions({
    name: "FileUploadController"
  })

  let props = defineProps<{'isAutoUpload'?: boolean}>()
  
  /**
   * 当前组件操作的文件对象
   */
  let fileObj:File
  /**
   * 当前是否处于上传文件中
   */
  let isUpload = ref(false)
  /**
   * 当前是否处于上传暂停
   */
  let isPause = ref(false)
  /**
   * 当前是否处于上传停止
   */
  let isStop = ref(false)
  /**
   * 当前是否处于上传初始化状态
   * 即刚拿到文件对象，还未进行任何操作时的状态
   */
  let isInit = computed(() => !isUpload.value && !isPause.value && !isStop.value)

  
  const startUpload = () => {
    isPause.value = false
    isStop.value = false
    isUpload.value = true
  }
  const restartUpload = () => {
    isPause.value = false
    isStop.value = false
    isUpload.value = true
  }
  const puaseUpload = () => {
    isPause.value = true
    isStop.value = false
    isUpload.value = false
  }
  const stopUpload = () => {
    isPause.value = false
    isStop.value = true
    isUpload.value = false
  }

  /**
   * 设置当前需要上传的文件对象
   * @param file 文件对象
   */
  const setFileObj = (file: File) => {
    fileObj = file
    isPause.value = false
    isStop.value = false
    isUpload.value = false
  }

  defineExpose({setFileObj})

</script>
<style scoped>
.firstContainer{
  display: flex;
  height: 60px;
  align-items: center;
}

.fileName{
  display: flex;
  justify-content: flex-start;
  font-size: 25px;
}

.operatePanel{
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.iconify{
  vertical-align: -0.15em;
}

.progressDiv{
  height: 40px;
  padding-top: 15px;
}

</style>
