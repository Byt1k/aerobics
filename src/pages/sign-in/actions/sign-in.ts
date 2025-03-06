import { FormState } from '../ui'
import { axiosInstance, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/kernel/instance'
import { startPage } from '@/kernel/routes'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

export const signInAction = async (
    _: FormState,
    formData: FormData,
): Promise<FormState> => {
    const data = Object.fromEntries(formData.entries()) as unknown as FormState

    try {
        const { data: response } = await axiosInstance.post<ResponseData>(
            '/user-service/api/token',
            {
                ...data,
                grant_type: '',
                scope: '',
                client_id: '',
                client_secret: '',
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }
        )

        const { access_token, refresh_token } = response

        Cookies.set(ACCESS_TOKEN_KEY, access_token, { path: '/' })
        Cookies.set(REFRESH_TOKEN_KEY, refresh_token, { path: '/' })

        window.location.pathname = startPage()

        return {
            username: '',
            password: '',
            error: null,
        }
    } catch (e: any) {
        return {
            username: data.username,
            password: data.password,
            error: e.status === 422 ? 'Неверное имя пользователя или пароль' : e.message,
        }
    }
}

interface ResponseData {
    access_token: string
    refresh_token: string
    token_type: string
}
