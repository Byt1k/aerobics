import { axiosInstance } from '@/kernel/instance'
import { formatQueryParams } from '@/shared/lib/formatQueryParams'

export const uploadParticipants = (competitionId: number, file: File, options: Options): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)

    return axiosInstance.post(
        `competition-service/api/participant/${competitionId}/from-xlsx` + formatQueryParams(options),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    )
}

interface Options {
    shuffle: boolean
    file_format: 'normal' | 'generated'
}