/*
 * @description: 文件上传各阶段状态逻辑处理Hook
 * @fileName: useUploadStatus.ts 
 * @author: feng 
 * @date: 2025-04-03 10:20:46 
 */
import {ref, computed} from 'vue'
import { FileUploadStatusEnum } from '@/enums/file-enum'


export default function useUploadStatus(){
  /**
   * 文件上传状态
   */
  let uploadStatus = ref(FileUploadStatusEnum.INIT)

  /**
   * 是否展示开始按钮
   * 当处于初始化状态或者暂停状态时显示按钮
   */
  let isShowStartBtn = computed(() => uploadStatus.value == FileUploadStatusEnum.INIT || uploadStatus.value == FileUploadStatusEnum.PAUSE)
  /**
   * 是否展示暂停按钮
   * 当处于上传状态时显示暂停按钮
   */
  let isShowPauseBtn = computed(() => uploadStatus.value == FileUploadStatusEnum.UPLOAD)
  /**
   * 是否显示停止按钮
   * 当处于上传状态或者暂停状态时显示停止按钮
   */
  let isShowStopBtn = computed(() => uploadStatus.value == FileUploadStatusEnum.UPLOAD || uploadStatus.value == FileUploadStatusEnum.PAUSE)
  /**
   * 是否显示重新上传按钮
   * 当处于停止状态时显示重新上传按钮
   */
  let isShwoRestartBtn = computed(() => uploadStatus.value == FileUploadStatusEnum.STOP)

  return {uploadStatus, isShowStartBtn, isShowPauseBtn, isShowStopBtn, isShwoRestartBtn}
}