import { axiosInstance } from '@/kernel/instance'
import { formatQueryParams } from '@/shared/lib/formatQueryParams'

export const downloadParticipants = async (competition_id: number, protocol_title?: string) => {
    const response = await axiosInstance.get(`/competitions/api/participant/${competition_id}/to-xlsx` + formatQueryParams({ protocol_title }), {
        responseType: 'blob'
    })

    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)

    // Определение имени файла и типа (если возможно)
    const contentDisposition = response.headers['content-disposition']
    let filename = 'participants.xlsx' // Имя по умолчанию
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch && filenameMatch.length === 2) {
            filename = filenameMatch[1]
        }
    }

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
}