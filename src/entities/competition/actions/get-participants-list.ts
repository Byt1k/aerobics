import { axiosInstance } from '@/kernel/instance'
import { Competition, Participant } from '../model/types'

export const getParticipantsList = (competitionId: number): Promise<Participant[]> =>
    axiosInstance.get<Participant[]>(`competitions/api/participant/${competitionId}`)
        .then(res => res.data)