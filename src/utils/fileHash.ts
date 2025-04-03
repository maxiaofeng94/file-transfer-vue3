/*
 * @description: 计算文件哈希值相关通用函数
 * @fileName: fileHash.ts 
 * @author: feng 
 * @date: 2025-04-02 17:25:36 
 */
import CryptoJS from 'crypto-js'

/**
 * 计算文件的SHA256哈希值
 * @param file 文件对象
 * @returns 文件SHA256哈希值
 */
export const calSHA256 = async (file: File, progressCallback: (progressNum: number) => void): Promise<string> => {
  // 开始计时
  const start = performance.now()
  
  const chunkSize = 1024 * 1024 * 2; // 每次读取2MB
  const chunks = Math.ceil(file.size / chunkSize);
  const sha256 = CryptoJS.algo.SHA256.create();;

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    const chunkBuffer = (await readFileAsArrayBuffer(chunk)) as ArrayBuffer;
    
    // 更新哈希
    const wordArray = CryptoJS.lib.WordArray.create(chunkBuffer);
    sha256.update(wordArray);
    
    // 更新进度
    progressCallback(((i + 1) / chunks) * 100);
  }

  // 计算耗时（毫秒）
  const duration = performance.now() - start
  console.debug(`耗时: ${duration.toFixed(2)}ms`)
  
  // 返回哈希值
  const hashCode = sha256.finalize().toString(CryptoJS.enc.Hex)
  return hashCode;
}

function readFileAsArrayBuffer(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}