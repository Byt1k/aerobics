import { axiosInstance } from '@/kernel/instance'
import { formatQueryParams } from '@/shared/lib/formatQueryParams'

export const downloadCompetitionReport = ({ competition_id, ...params }: Params) =>
    axiosInstance.get(`/competitions/${competition_id}/results` + formatQueryParams(params))

interface Params {
    competition_id: number
    date_string: string
    main_judge: string
    main_secretary: string
    nomination?: string
    age_group?: string
}