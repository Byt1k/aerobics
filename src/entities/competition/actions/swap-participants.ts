import { axiosInstance } from '@/kernel/instance'
import { formatQueryParams } from '@/shared/lib/formatQueryParams'

export const swapParticipants = (competitionId: number, dto: SwapParticipantsDto): Promise<void> => {
    return axiosInstance.post(`competitions/api/swap-participants/${competitionId}/` + formatQueryParams(dto))
}

interface SwapParticipantsDto {
    participant_order_num_1: number
    participant_order_num_2: number
}