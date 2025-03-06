import { axiosInstance } from '@/kernel/instance'
import { UserType } from '../model/types'

export const getMe = async (): Promise<UserType> => {
    const { data } = await axiosInstance.get<UserType>('user-service/api/me')
    return data
}
