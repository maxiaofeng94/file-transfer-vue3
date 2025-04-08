<!--
 * @description: 文件上传控制组件
 * @fileName: FileUploadController.vue 
 * @author: feng 
 * @date: 2025-04-02 08:19:56 
!-->
<template>
  <div class="container">
    <div class="firstContainer">
      <div class="fileName" :title="fileName">{{ fileName }}</div>
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
  import {ref, computed} from 'vue'
  import useUploadStatus from '@/hooks/useUploadStatus';
  import useUploadFile from '@/hooks/useUploadFile';
  import { FileUploadStatusEnum } from '@/enums/file-enum';
  import {calSHA256} from '@/utils/fileHash'

  defineOptions({
    name: "FileUploadController"
  })

  let props = defineProps<{'isAutoUpload'?: boolean}>()
  
  const {uploadStatus, isShowStartBtn, isShowPauseBtn, isShowStopBtn, isShwoRestartBtn} = useUploadStatus()
  const {uploadProgress, startUploadFile, pauseUploadFile, stopUploadFile} = useUploadFile()

  /**
   * 当前组件操作的文件对象
   */
  let fileObj:File
  /**
   * 当前文件名称
   */
  let fileName = ref("")
  /**
   * 文件哈希值计算进度
   */
  let calcProgress = ref(0)
  /**
   * 进度条显示文件
   */
  let progressTxt = ref("")
  /**
   * 进度条进度，保留小数点后一位显示
   */
  const progress = computed(() => Math.round((uploadStatus.value == FileUploadStatusEnum.CALCHASH ? calcProgress.value : uploadProgress.value) * 10) / 10)
  
  const startUpload = () => {
    if(uploadStatus.value == FileUploadStatusEnum.INIT){
      uploadStatus.value = FileUploadStatusEnum.CALCHASH
      calcProgress.value = 0
      progressTxt.value = '哈希值计算'
      calSHA256(fileObj, num => calcProgress.value = num)
        .then((fileHashCode) => {
          uploadStatus.value = FileUploadStatusEnum.UPLOAD
          progressTxt.value = '文件上传'
          startUploadFile(fileObj, fileHashCode).then(uploadSuccess).catch(uploadError)
        })
        .catch((err) => {
          console.error(err)
          uploadStatus.value = FileUploadStatusEnum.INIT
        })
    }else{
      uploadStatus.value = FileUploadStatusEnum.UPLOAD
      progressTxt.value = '文件上传'
      startUploadFile().then(uploadSuccess).catch(uploadError)
    }
  }
  const puaseUpload = () => {
    uploadStatus.value = FileUploadStatusEnum.PAUSE
    pauseUploadFile()
  }
  const stopUpload = () => {
    uploadStatus.value = FileUploadStatusEnum.STOP
    stopUploadFile()
  }
  const restartUpload = () => {
    uploadStatus.value = FileUploadStatusEnum.UPLOAD
    startUploadFile().then(uploadSuccess).catch(uploadError)
  }

  /**
   * 文件上传成功回调函数
   * @param fileId 文件Id
   */
  const uploadSuccess = (fileId: string) => {
    if(fileId && fileId.length > 0){
      console.log(fileId)
      uploadStatus.value = FileUploadStatusEnum.SUCCESS
    }else{
      console.log("执行了暂停操作")
    }
  }
  const uploadError = (err:any) => {
    console.error(err)
    uploadStatus.value = FileUploadStatusEnum.STOP
  }

  /**
   * 设置当前需要上传的文件对象
   * @param file 文件对象
   * @returns 是否设置成功
   */
  const setFileObj = (file: File): boolean => {
    //如果当前不是空、初始、停止、成功状态，则无法设置新的文件上传对象
    if(uploadStatus.value != FileUploadStatusEnum.NONE &&
      uploadStatus.value != FileUploadStatusEnum.INIT &&
      uploadStatus.value != FileUploadStatusEnum.STOP &&
      uploadStatus.value != FileUploadStatusEnum.SUCCESS
    ){
      return false
    }

    fileObj = file
    fileName.value = file.name
    uploadStatus.value = FileUploadStatusEnum.INIT
    return true
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
  min-width: 0; /* 防止内容溢出容器 */
  display: -webkit-box; /* 将对象作为弹性伸缩盒子模型显示 */
  -webkit-line-clamp: 1; /* 显示的行数 */
  -webkit-box-orient: vertical; /* 设置或检索伸缩盒对象的子元素的排列方式 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 文字超出时显示省略号 */
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
