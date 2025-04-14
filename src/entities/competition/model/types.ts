export const competitionStatuses = {
    not_started: "Ожидается",
    ongoing: "Проходит",
    finished: "Завершено",
}

type CompetitionStatus = keyof typeof competitionStatuses

export interface Competition {
    title: string
    stage: string
    date_start: string | null
    queues_amount: number
    status: CompetitionStatus
    id: number
}

export interface Participant {
    competition_id: number
    names: string
    nomination_shortened: string
    nomination: string
    age_group: string
    queue_index: number
    order_num: number
    city: string
    country: string
    id: number
    confirmed: boolean
}

