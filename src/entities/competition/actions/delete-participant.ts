import { axiosInstance } from '@/kernel/instance'

export const deleteCompetitionParticipant = (id: number) =>
    axiosInstance.delete('/competitions/api/participant/' + id)