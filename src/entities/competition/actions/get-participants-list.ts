import { axiosInstance } from '@/kernel/instance'
import { Participant } from '../model/types'

export const getParticipantsList = (competitionId: number): Promise<Participant[]> =>
    axiosInstance.get<Participant[]>(`competition-service/api/participant/${competitionId}`)
        .then(res => res.data)