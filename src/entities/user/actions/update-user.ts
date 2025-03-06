import { FormState } from '../ui/editor-popup'
import { axiosInstance } from '@/kernel/instance'

export const updateUserAction = async (userId: number, dto: FormState): Promise<void> => {
    await axiosInstance.patch(`/user-service/api/user/${userId}`, dto)
}