import { axiosInstance } from '@/kernel/instance'

export const changeParticipantName = (id: number, names: string) => {
    return axiosInstance.patch(`/competitions/api/participant/change-name/${id}`, { names })
}