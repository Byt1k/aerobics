import { FormState } from '../ui/editor-popup'
import { axiosInstance } from '@/kernel/instance'

export const updateCompetitionAction = async (competitionId: number, dto: FormState): Promise<void> => {
    await axiosInstance.patch(`/competitions/api/competition/${competitionId}`, dto)
}