/*
 * @description: 上传文件相关逻辑hook
 * @fileName: useUploadFile.ts 
 * @author: feng 
 * @date: 2025-04-02 17:23:44 
 */
import {ref} from 'vue'
import {http} from '@/utils/http'
import { ContentTypeEnum } from '@/enums/request-enum'
import {calBlobSHA256} from '@/utils/fileHash'

export default function useUploadFile(){
  /**
   * 上传文件相关url地址
   */
  const uploadUrls = {
    /**
     * 查询文件存在状态
     */
    getStatus: 'file/getStatus',
    /**
     * 单个分块文件上传
     */
    uploadBlock: 'file/uploadBlock',
    /**
     * 分块文件合并
     */
    merge: 'file/merge',
    /**
     * 中止文件上传
     */
    stop: 'file/stop'
  }
  
  /**
   * 文件上传进度
   */
  let uploadProgress = ref(0)
  /**
   * 操作文件对象
   */
  let fileObj: File
  /**
   * 分块文件大小，当前设置为2MB
   */
  const chunkSize: number = 1024 * 1024 * 5
  /**
   * 分块文件上传并发数
   */
  const uploadConcurrency: number = 5
  /**
   * 开始上传分块文件的索引号（在暂停上传后继续上传时使用）
   */
  let startChunkNum: number = 0 
  /**
   * 文件传输Id
   */
  let transferId: string = ''
  /**
   * 完整文件哈希值
   */
  let hashCode: string
  /**
   * 当前是否暂停上传
   */
  let isPause: boolean = false

  /**
   * 开始上传文件
   * 可在初始化上传、暂停后继续上传、停止后重新上传时使用
   * @param file 文件对象
   * @param fileHashCode 文件哈希值
   */
  const start = async (file?: File, fileHashCode?: string): Promise<string> => {
    isPause = false

    let uploadResult = false

    //获取传输文件Id
    if(transferId.length == 0 || file != null){
      if(file != null && fileHashCode != null){
        fileObj = file
        hashCode = fileHashCode
      }
      uploadProgress.value = 0

      const data = await http.get<any, any>(uploadUrls.getStatus, {fileHashCode: hashCode, fileName: fileObj.name})
      // 已存在同样哈希值的文件，不用再重新上传
      if(data.status == 1){
        uploadProgress.value = 100
        return data.fileId
      }else{
        transferId = data.fileId
        startChunkNum = 0
        //上传分块文件
        uploadResult = await uploadBlockFiles()
      }
    }else{
      //上传分块文件
      uploadResult = await uploadBlockFiles()
    }

    // 由于执行暂停操作，需要返回空字符串，表示上传操作还未完成
    if(!uploadResult){
      return ""
    }

    //合并文件
    const fileId = await http.post<string, any>(uploadUrls.merge, {transferId: transferId, fileHashCode: hashCode, fileName: fileObj.name})
    uploadProgress.value = 100

    return fileId
  }

  /**
   * 上传分块文件
   * @returns 是否执行成功，true表示所有分块文件已完成上传，false表示由于暂停操作暂停了分块文件上传
   */
  const uploadBlockFiles = async (): Promise<boolean> => {
    // 分块文件个数
    const chunks = Math.ceil(fileObj.size / chunkSize)
    // 每个分块文件上传成功后可增加的进度
    const progerssPerChunk = 99 / chunks

    for(let i = startChunkNum; i < chunks; i+=uploadConcurrency){
      if(isPause){
        return false
      }

      const nextStartChunNum = i + uploadConcurrency < chunks ? i + uploadConcurrency : chunks
      let requests:Promise<any>[] = []
      for(let j = i; j < nextStartChunNum; j++){
        // 获取文件分块
        const start = j * chunkSize
        const end = Math.min(start + chunkSize, fileObj.size)
        const chunk = fileObj.slice(start, end)

        // 计算文件分块哈希值
        const chunkHashCode = await calBlobSHA256(chunk)

        // 调用分块文件上传接口
        requests.push(
          http.post(uploadUrls.uploadBlock, 
            {file: chunk, transferId: transferId, blockNum: j + 1, 
              blockHashCode: chunkHashCode, fileHashCode: hashCode}, 
            {headers:{"Content-Type": ContentTypeEnum.FORM_DATA}}
          ).then(() => {
            // 更新上传文件进度（在每个请求执行完成后更新进度，可以让进度条显示更加顺滑）
            uploadProgress.value += progerssPerChunk
          }))
      }

      // 等待多个分块文件上传请求执行完成
      await Promise.all(requests)
      // 更新当前开始读取的分块文件序号
      startChunkNum = nextStartChunNum
    }

    return true
  }

  /**
   * 暂停上传文件
   */
  const pause = () => {
    isPause = true
  }

  /**
   * 停止上传文件
   */
  const stop = () => {
    http.post(uploadUrls.stop, {transferId: transferId, fileHashCode: hashCode})

    transferId = ''
    uploadProgress.value = 0
  }

  return {uploadProgress, startUploadFile: start, pauseUploadFile: pause, stopUploadFile: stop}
}