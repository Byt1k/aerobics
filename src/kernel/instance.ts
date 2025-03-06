import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

export const axiosInstance = axios.create({
    baseURL: 'http://89.111.153.211/',
})

export const ACCESS_TOKEN_KEY = 'aerobics_access_token'
export const REFRESH_TOKEN_KEY = 'aerobics_refresh_token'

axiosInstance.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${Cookies.get(ACCESS_TOKEN_KEY)}`
    return config
})

let isRefreshing: boolean = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config!

        if (error.response?.status === 401 && !originalRequest._retry && error.response.config.url !== 'user-service/api/refresh') {

            if (isRefreshing) {
                try {
                    const token = await new Promise<string>(function (resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    });

                    originalRequest.headers = {
                        ...originalRequest.headers,
                        Authorization: 'Bearer ' + token,
                    };
                    return axiosInstance(originalRequest);
                } catch (err) {
                    return Promise.reject(err);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = Cookies.get(REFRESH_TOKEN_KEY)

                const response = await axiosInstance.post<RefreshTokenResponse>('user-service/api/refresh', {
                    refresh_token: refreshToken,
                });
                const { access_token, refresh_token } = response.data

                Cookies.set(ACCESS_TOKEN_KEY, access_token, { path: '/' });
                Cookies.set(REFRESH_TOKEN_KEY, refresh_token, { path: '/' });

                axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: 'Bearer ' + access_token,
                };

                processQueue(null, access_token);
                return axiosInstance(originalRequest);
            } catch (err) {
                processQueue(err as AxiosError, null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }


        return Promise.reject(error)
    }
)

interface RefreshTokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
}
