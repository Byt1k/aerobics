import { axiosInstance } from '@/kernel/instance'
import { UserRoleId } from '@/entities/user'

export const setUserToCompetition = async ({ competitionId, userId, roleId, queueIndex }: UserToCompetitionPayload) => {
    if (queueIndex) {
        await axiosInstance.post(`/competitions/api/enqueue/${userId}/${competitionId}/${queueIndex}`)
    }

    await axiosInstance.post(`/user-service/api/role/set/${userId}/${roleId}/${competitionId}`)
}

export interface UserToCompetitionPayload {
    competitionId: number
    userId: number
    roleId: UserRoleId
    queueIndex?: number
}