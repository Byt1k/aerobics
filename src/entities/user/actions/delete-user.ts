import { axiosInstance } from '@/kernel/instance'

export const deleteUserAction = async (userId: number): Promise<void> => {
    await axiosInstance.delete(`/user-service/api/user/${userId}`)
}