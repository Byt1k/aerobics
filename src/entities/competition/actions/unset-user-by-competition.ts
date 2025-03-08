import { axiosInstance } from '@/kernel/instance'

export const unsetUserByCompetition = async (userId: number,  competitionId: number) => {
    await axiosInstance.delete(`/user-service/api/role/unset/${userId}/${competitionId}`)
}