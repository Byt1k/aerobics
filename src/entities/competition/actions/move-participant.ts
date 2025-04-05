import { axiosInstance } from '@/kernel/instance'
import { formatQueryParams } from '@/shared/lib/formatQueryParams'

export const moveParticipant = (competitionId: number, dto: SwapParticipantsDto): Promise<void> => {
    return axiosInstance.post(`competition-service/api/move-participant/${competitionId}` + formatQueryParams(dto))
}

interface SwapParticipantsDto {
    participant_order_num: number
    new_participant_order_num: number
}