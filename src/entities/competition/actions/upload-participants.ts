import { axiosInstance } from '@/kernel/instance'
import { formatQueryParams } from '@/shared/lib/formatQueryParams'

export const uploadParticipants = (competitionId: number, file: File, shuffle: boolean): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)

    return axiosInstance.post(
        `competitions/api/participant/${competitionId}/from-xlsx` + formatQueryParams({ shuffle }),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    )
}