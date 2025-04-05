import { axiosInstance } from '@/kernel/instance'

export const deleteCompetitionParticipant = (id: number) =>
    axiosInstance.delete('/competition-service/api/participant/' + id)