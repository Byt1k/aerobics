import { axiosInstance } from '@/kernel/instance'
import { UserByCompetition } from '@/entities/user'

export const getUsersByCompetition = async (competitionId: number): Promise<UserByCompetition[]> => {
    return axiosInstance.get<UserByCompetition[]>(`/user-service/api/users-by-competition/${competitionId}`)
        .then(res => res.data)
}



