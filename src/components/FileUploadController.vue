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
        <van-button size="mini" title="暂停" @click="pauseUpload" v-if="isShowPauseBtn">
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
  import { ref, computed } from 'vue'
  import useUploadStatus from '@/hooks/useUploadStatus';
  import useUploadFile from '@/hooks/useUploadFile';
  import { FileUploadStatusEnum, FileUploadOpEnum } from '@/enums/file-enum';
  import { calSHA256 } from '@/utils/fileHash'
  import { showConfirmDialog } from 'vant';
  import 'vant/es/dialog/style';

  defineOptions({
    name: "FileUploadController"
  })

  /**
   * 定义组件参数：
   * isAutoUpload，设置操作文件对象后是否自动开始上传操作
   * isShowConfirm，点击上传控制按钮时是否显示确认弹窗
   */
  let props = defineProps<{'isAutoUpload'?: boolean, 'isShowConfirm'?: boolean}>()
  /**
   * 定义组件事件
   * beforeControl，文件上传控制（如开始、暂停、继续、停止、重新上传等）操作执行前事件，传入参数：控制操作类型
   * controlled，文件上传控制操作执行后事件，传入参数：控制操作类型
   * fileHashCodeCalculated，文件哈希值计算完成事件，传入参数：文件哈希值
   * fileUploadSucceed，文件上传成功事件，传入参数：文件Id值
   * fileUploadFailed，文件上传失败事件，传入参数：无
   */
  const emit = defineEmits(['beforeControl', 'controlled', 'fileHashCodeCalculated', 'fileUploadSucceed', 'fileUploadFailed'])
  
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
      emit('beforeControl', { opType: FileUploadOpEnum.START })
      if(props.isShowConfirm){
        showOpConfirm(FileUploadOpEnum.START, startOp)
      }else{
        startOp()
      }
    }else{
      emit('beforeControl', { opType: FileUploadOpEnum.CONTINUE })
      if(props.isShowConfirm){
        showOpConfirm(FileUploadOpEnum.CONTINUE, continueOp)
      }else{
        continueOp()
      }
    }
  }
  const startOp = () => {
    uploadStatus.value = FileUploadStatusEnum.CALCHASH
    calcProgress.value = 0
    progressTxt.value = '哈希值计算'
    calSHA256(fileObj, num => calcProgress.value = num)
      .then((fileHashCode) => {
        emit('fileHashCodeCalculated', { fileHashCode })

        uploadStatus.value = FileUploadStatusEnum.UPLOAD
        progressTxt.value = '文件上传'
        startUploadFile(fileObj, fileHashCode).then(uploadSuccess).catch(uploadError)
      })
      .catch((err) => {
        console.error(err)
        uploadStatus.value = FileUploadStatusEnum.INIT

        emit('fileUploadFailed')
      })

    emit('controlled', { opType: FileUploadOpEnum.START })
  }
  const continueOp = () => {
    uploadStatus.value = FileUploadStatusEnum.UPLOAD
    progressTxt.value = '文件上传'
    startUploadFile().then(uploadSuccess).catch(uploadError)
    emit('controlled', { opType: FileUploadOpEnum.CONTINUE })
  }

  const pauseUpload = () => {
    emit('beforeControl', { opType: FileUploadOpEnum.PAUSE })
    if(props.isShowConfirm){
      showOpConfirm(FileUploadOpEnum.PAUSE, pauseOp)
    }else{
      pauseOp()
    }
  }
  const pauseOp = () => {
    uploadStatus.value = FileUploadStatusEnum.PAUSE
    pauseUploadFile()

    emit('controlled', { opType: FileUploadOpEnum.PAUSE })
  }

  const stopUpload = () => {
    emit('beforeControl', { opType: FileUploadOpEnum.STOP })
    if(props.isShowConfirm){
      showOpConfirm(FileUploadOpEnum.STOP, stopOp)
    }else{
      stopOp()
    }
  }
  const stopOp = () => {
    uploadStatus.value = FileUploadStatusEnum.STOP
    stopUploadFile()

    emit('controlled', { opType: FileUploadOpEnum.STOP })
  }

  const restartUpload = () => {
    emit('beforeControl', { opType: FileUploadOpEnum.RESTART })
    if(props.isShowConfirm){
      showOpConfirm(FileUploadOpEnum.RESTART, restartOp)
    }else{
      restartOp()
    }
  }
  const restartOp = () => {
    uploadStatus.value = FileUploadStatusEnum.UPLOAD
    startUploadFile().then(uploadSuccess).catch(uploadError)

    emit('controlled', { opType: FileUploadOpEnum.RESTART })
  }

  const showOpConfirm = (opType: FileUploadOpEnum, confirmCallback: ()=>void) => {
    let msg = ''
    switch(opType){
      case FileUploadOpEnum.START:
        msg = '开始'
        break
      case FileUploadOpEnum.PAUSE:
        msg = '暂停'
        break
      case FileUploadOpEnum.CONTINUE:
        msg = '继续'
        break
      case FileUploadOpEnum.STOP:
        msg = '停止'
        break
      case FileUploadOpEnum.RESTART:
        msg = '重新开始'
        break
    }

    showConfirmDialog({
      title: '文件上传',
      message: '是否确认 ' + msg + ' ?',
    }).then(confirmCallback)
    .catch(()=>{
      console.debug('取消了 ' + msg + ' 操作')
    })
  }

  /**
   * 文件上传成功回调函数
   * @param fileId 文件Id
   */
  const uploadSuccess = (fileId: string) => {
    // 只有fileId不为空字符串时，才表示真正上传成功；否则可能是暂停操作引起此回调函数调用
    if(fileId && fileId.length > 0){
      console.log(fileId)
      uploadStatus.value = FileUploadStatusEnum.SUCCESS

      emit('fileUploadSucceed', { fileId })
    }
  }
  /**
   * 文件上传失败回调函数
   * @param err 报错信息
   */
  const uploadError = (err:any) => {
    console.error(err)
    uploadStatus.value = FileUploadStatusEnum.STOP

    emit('fileUploadFailed')
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

    // 如果设置了自动上传，则立即触发开始操作
    if(props.isAutoUpload){
      startUpload()
    }

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
