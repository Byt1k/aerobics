import { axiosInstance } from '@/kernel/instance'

export const deleteCompetitionAction = async (userId: number): Promise<void> => {
    await axiosInstance.delete(`/competition-service/api/competition/${userId}`)
}