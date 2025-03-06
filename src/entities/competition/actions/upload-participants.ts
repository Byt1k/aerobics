import { axiosInstance } from '@/kernel/instance'

export const uploadParticipants = (competitionId: number, file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)

    return axiosInstance.post(
        `competitions/api/participant/${competitionId}/from-xlsx`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    )
}