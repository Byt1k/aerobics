import { axiosInstance } from '@/kernel/instance'

export const changeParticipantSubject = (id: number, dto: { city: string; country: string }) => {
    return axiosInstance.patch(`/competition-service/api/participant/change-subject/${id}`, dto)
}