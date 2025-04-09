import Axios, {
    type AxiosInstance,
    type AxiosError,
    type AxiosResponse,
    type AxiosRequestConfig
  } from "axios";
import { ContentTypeEnum, ResultEnum } from "@/enums/request-enum";
import NProgress from "../progress";
import { showFailToast } from "vant";
import "vant/es/toast/style";

export interface MyAxiosRequestConfig extends AxiosRequestConfig{
  isShowToast?: boolean,
  isShowProgress?: boolean
}
// 默认 axios 实例请求配置
const configDefault: MyAxiosRequestConfig = {
  headers: {
    "Content-Type": ContentTypeEnum.FORM_URLENCODED
  },
  timeout: 0,
  baseURL: import.meta.env.VITE_BASE_API,
  data: {},
  isShowToast: true,
  isShowProgress: true
};

class Http {
    // 当前实例
    private static axiosInstance: AxiosInstance;
    // 请求配置
    private static axiosConfigDefault: MyAxiosRequestConfig;
  
    // 请求拦截
    private httpInterceptorsRequest(): void {
      Http.axiosInstance.interceptors.request.use(
        config => {
          const { isShowProgress } = config as MyAxiosRequestConfig
          if(isShowProgress){
            NProgress.start();
          }
          // 发送请求前，可在此携带 token
          // if (token) {
          //   config.headers['token'] = token
          // }
          return config;
        },
        (error: AxiosError) => {
          showFailToast(error.message);
          return Promise.reject(error);
        }
      );
    }
  
    // 响应拦截
    private httpInterceptorsResponse(): void {
      Http.axiosInstance.interceptors.response.use(
        (response: AxiosResponse) => {
          const { isShowProgress, isShowToast } = response.config as MyAxiosRequestConfig

          if(isShowProgress){
            NProgress.done();
          }
          // 与后端协定的返回字段
          const { code, data } = response.data;
          const { message } = response.data;
          // 判断请求是否成功
          const isSuccess =
            Reflect.has(response.data, "code") &&
            code === ResultEnum.SUCCESS;
          if (isSuccess) {
            return data;
          } else {
            // 处理请求错误
            if(isShowToast){
              showFailToast(message);
            }
            return Promise.reject(response.data);
          }
        },
        (error: AxiosError) => {
          const { isShowProgress, isShowToast } = error.config ? 
            error.config as MyAxiosRequestConfig : 
            {isShowProgress: true, isShowToast: true}

          if(isShowProgress){
            NProgress.done();
          }
          if(!isShowToast){
            return Promise.reject(error);
          }

          // 处理 HTTP 网络错误
          let message = "";
          // HTTP 状态码
          const status = error.response?.status;
          switch (status) {
            case 400:
              message = "请求错误";
              break;
            case 401:
              message = "未授权，请登录";
              break;
            case 403:
              message = "拒绝访问";
              break;
            case 404:
              message = `请求地址出错: ${error.response?.config?.url}`;
              break;
            case 408:
              message = "请求超时";
              break;
            case 500:
              message = "服务器内部错误";
              break;
            case 501:
              message = "服务未实现";
              break;
            case 502:
              message = "网关错误";
              break;
            case 503:
              message = "服务不可用";
              break;
            case 504:
              message = "网关超时";
              break;
            case 505:
              message = "HTTP版本不受支持";
              break;
            default:
              message = "网络连接故障";
          }
  
          showFailToast(message);
          return Promise.reject(error);
        }
      );
    }
  
    constructor(config: MyAxiosRequestConfig) {
      Http.axiosConfigDefault = config;
      Http.axiosInstance = Axios.create(config);
      this.httpInterceptorsRequest();
      this.httpInterceptorsResponse();
    }
  
    // 通用请求函数
    public request<T>(paramConfig: MyAxiosRequestConfig): Promise<T> {
      const config = { ...Http.axiosConfigDefault, ...paramConfig };
      return new Promise((resolve, reject) => {
        Http.axiosInstance
          .request(config)
          .then((response: any) => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      });
    }

    // GET请求函数
    public get<T, U>(url: string, data?: U, config?: MyAxiosRequestConfig): Promise<T> {
      const getConfig: MyAxiosRequestConfig = { ...Http.axiosConfigDefault, ...config, params: data };
      return Http.axiosInstance.get(url, getConfig)
    }

    // POST请求函数
    public post<T, U>(url: string, data?: U, config?: MyAxiosRequestConfig): Promise<T> {
      const getConfig: MyAxiosRequestConfig = { ...Http.axiosConfigDefault, ...config };
      return Http.axiosInstance.post(url, data, getConfig)
    }

}

export const http = new Http(configDefault);
  