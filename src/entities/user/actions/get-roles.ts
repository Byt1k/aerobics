import { axiosInstance } from '@/kernel/instance'
import { UserRole } from '../model/types'

export const getRoles = (): Promise<UserRole[]> =>
    axiosInstance.get<UserRole[]>('user-service/api/role')
        .then(res => res.data)
