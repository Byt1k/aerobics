import { axiosInstance } from '@/kernel/instance'
import { Competition } from '../model/types'

export const getCompetitionsList = (): Promise<Competition[]> =>
    axiosInstance.get<Competition[]>('competitions/api/competition')
        .then(res => res.data)
        .catch(() => [])
