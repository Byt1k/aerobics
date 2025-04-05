import { axiosInstance } from '@/kernel/instance'
import { Competition } from '../model/types'

export const getCompetitionsList = (): Promise<Competition[]> =>
    axiosInstance.get<Competition[]>('competition-service/api/competition')
        .then(res => res.data)
        .catch(() => [])
