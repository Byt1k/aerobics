import { axiosInstance } from '@/kernel/instance'
import { formatQueryParams } from '@/shared/lib/formatQueryParams'

export const moveNomination = (competitionId: number, dto: MoveNominationDto): Promise<void> => {
    return axiosInstance.post(`competition-service/api/move-nomination/${competitionId}` + formatQueryParams(dto))
}

interface MoveNominationDto {
    nomination_start_order_num : number
    new_start_order_num: number
}