import { axiosInstance } from '@/kernel/instance'
import { Competition } from '../model/types'

export const getCompetition = (id: string): Promise<Competition> =>
    axiosInstance.get<Competition>(`competition-service/api/competition/${id}`)
        .then(res => res.data)
