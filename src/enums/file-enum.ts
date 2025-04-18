/*
 * @description: 定义文件相关的枚举
 * @fileName: file-enum.ts 
 * @author: feng 
 * @date: 2025-04-03 10:42:15 
 */

/**
 * 文件上传状态
 * 当前文件状态流转为：none➡init（初始化状态，未对文件进行任何操作）➡calcHash（计算文件哈希值状态）➡upload（文件调用后端接口上传状态）➡success（文件上传成功）
 *                                                                                                |                     ⬆--------|
 *                                                                                                |                               |
 *                                                                                                |➡pause（文件上传暂停状态）-----|
 *                                                                                                |                               |
 *                                                                                                |                               |
 *                                                                                                |➡stop（文件上传停止状态）----- |
 */
export enum FileUploadStatusEnum {
  /**
   * 空状态，此时无文件对象可操作
   */
  NONE,
  /**
   * 初始状态，未对文件进行任何操作
   */
  INIT,
  /**
   * 计算文件哈希值状态
   */
  CALCHASH,
  /**
   * 文件调用后端接口上传状态
   */
  UPLOAD,
  /**
   * 文件上传暂停状态
   */
  PAUSE,
  /**
   * 文件上传停止状态
   * 此状态可能时人工停止，或者上传过程中出现任何错误导致的停止
   */
  STOP,
  /**
   * 文件上传成功
   */
  SUCCESS
}

/**
 * 文件上传操作类型
 */
export enum FileUploadOpEnum {
  /**
   * 无操作
   */
  NONE,
  /**
   * 开始上传操作
   */
  START,
  /**
   * 暂停上传操作
   */
  PAUSE,
  /**
   * 停止上传操作
   */
  STOP,
  /**
   * 继续上传操作
   */
  CONTINUE,
  /**
   * 重新上传操作
   */
  RESTART
}