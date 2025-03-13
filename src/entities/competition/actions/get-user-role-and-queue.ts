import { UserRole } from '@/entities/user'
import { axiosInstance } from '@/kernel/instance'

export const getUserRoleAndQueue = (competitionId: string): Promise<UserRoleAndQueueByCompetition> =>
    axiosInstance
        .get<Response>(`/user-service/api/my-role-queue-index/competition/${competitionId}`)
        .then(res => ({
            role: res.data.roles[0],
            queue_index: res.data.queue_index,
        }))

export interface UserRoleAndQueueByCompetition {
    role: UserRole
    queue_index: number
}

interface Response {
    roles: [UserRole]
    queue_index: number
}