import { axiosInstance } from '@/kernel/instance'
import { formatQueryParams } from '@/shared/lib/formatQueryParams'

export const downloadCompetitionReport = async ({ competition_id, ...params }: Params) => {
    const response = await axiosInstance.get(`/competition-service/${competition_id}/results` + formatQueryParams(params), {
        responseType: 'blob'
    })

    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)

    // Определение имени файла и типа (если возможно)
    const contentDisposition = response.headers['content-disposition']
    let filename = 'report.zip' // Имя по умолчанию
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

interface Params {
    competition_id: number
    date_string: string
    main_judge: string
    main_secretary: string
    place: string
    nomination?: string
    age_group?: string
}