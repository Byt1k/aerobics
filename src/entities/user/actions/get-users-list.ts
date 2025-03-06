import { axiosInstance } from '@/kernel/instance'
import { UserType } from '../model/types'
import { formatQueryParams } from '@/shared/lib/formatQueryParams'

export const getUsersList = async (params?: GetUsersListParams): Promise<UserType[]> => {
    return axiosInstance.get<UserType[]>('/user-service/api/users' + formatQueryParams(params))
        .then(res => res.data)
        .catch(() => [])
}

interface GetUsersListParams {
    show_disabled?: boolean
}

