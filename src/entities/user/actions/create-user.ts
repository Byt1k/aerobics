import { FormState } from '../ui/editor-popup'
import { axiosInstance } from '@/kernel/instance'

export const createUserAction = async (dto: FormState): Promise<void> => {
    await axiosInstance.post('/user-service/api/signup', dto)
}