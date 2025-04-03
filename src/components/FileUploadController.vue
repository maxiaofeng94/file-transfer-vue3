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
        <van-button size="mini" title="开始" @click="startUpload" v-if="isShowStartBtn">
          <template #icon>
            <icon-codicon-debug-start class="iconify"></icon-codicon-debug-start>
          </template>
        </van-button>
        <van-button size="mini" title="暂停" @click="puaseUpload" v-if="isShowPauseBtn">
          <template #icon>
            <icon-codicon-debug-pause class="iconify"></icon-codicon-debug-pause>
          </template>
        </van-button>
        <van-button size="mini" title="停止" @click="stopUpload" v-if="isShowStopBtn">
          <template #icon>
            <icon-codicon-debug-stop class="iconify"></icon-codicon-debug-stop>
          </template>
        </van-button>
        <van-button size="mini" title="重新开始" @click="restartUpload" v-if="isShwoRestartBtn">
          <template #icon>
            <icon-codicon-debug-restart class="iconify"></icon-codicon-debug-restart>
          </template>
        </van-button>
      </div>
    </div>
    <div class="progressDiv">
      <van-progress :percentage="progress" :pivot-text="`${progressTxt}${progress}%`"></van-progress>
    </div>
  </div>
</template>
<script setup lang="ts">
  import {ref} from 'vue'
  import useUploadStatus from '@/hooks/useUploadStatus';
  import { FileUploadStatusEnum } from '@/enums/file-enum';
  import {calSHA256} from '@/utils/fileHash'

  defineOptions({
    name: "FileUploadController"
  })

  let props = defineProps<{'isAutoUpload'?: boolean}>()
  
  const {uploadStatus, isShowStartBtn, isShowPauseBtn, isShowStopBtn, isShwoRestartBtn} = useUploadStatus()

  /**
   * 当前组件操作的文件对象
   */
  let fileObj:File
  let progress = ref(0)
  let progressTxt = ref("")
  
  const startUpload = () => {
    if(uploadStatus.value == FileUploadStatusEnum.INIT){
      uploadStatus.value = FileUploadStatusEnum.CALCHASH
      progress.value = 0
      progressTxt.value = '哈希值计算'
      calSHA256(fileObj, num => progress.value = Math.round(num * 10) / 10)
        .then((fileHashCode) => {
          console.log(fileHashCode)
          uploadStatus.value = FileUploadStatusEnum.UPLOAD
          progress.value = 0
          progressTxt.value = '文件上传'
        })
        .catch(() => {
          uploadStatus.value = FileUploadStatusEnum.STOP
        })
    }else{
      uploadStatus.value = FileUploadStatusEnum.UPLOAD
      progress.value = 0
      progressTxt.value = '文件上传'
    }
  }
  const puaseUpload = () => {
    uploadStatus.value = FileUploadStatusEnum.PAUSE
  }
  const stopUpload = () => {
    uploadStatus.value = FileUploadStatusEnum.STOP
  }
  const restartUpload = () => {
    uploadStatus.value = FileUploadStatusEnum.UPLOAD
  }

  /**
   * 设置当前需要上传的文件对象
   * @param file 文件对象
   */
  const setFileObj = (file: File) => {
    fileObj = file
    uploadStatus.value = FileUploadStatusEnum.INIT
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
