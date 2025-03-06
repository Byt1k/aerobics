import { FormState } from '../ui/editor-popup'
import { axiosInstance } from '@/kernel/instance'

export const createCompetitionAction = async (dto: FormState): Promise<void> => {
    await axiosInstance.post('/competitions/api/competition', dto)
}