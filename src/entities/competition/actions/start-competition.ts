import { axiosInstance } from '@/kernel/instance'
import { Competition } from '../model/types'

export const startCompetition = (id: string): Promise<Competition> =>
    axiosInstance.post<Competition>(`competition-service/api/competition/${id}/start`)
        .then(res => res.data)
