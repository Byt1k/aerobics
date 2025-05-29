import { useCallback, useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import { ACCESS_TOKEN_KEY } from './instance'
import { Participant } from '@/entities/competition'
import { UserRoleTitle } from '@/entities/user'

export const useWebSocket = (competitionId: number) => {
    const [ws, setWs] = useState<WebSocket | null>(null)
    const isReconnectedRef = useRef(false)

    const connect = useCallback(() => {
        const token = Cookies.get(ACCESS_TOKEN_KEY)
        const url = import.meta.env.VITE_WS_URL + competitionId + '/' + token
        const newWs = new WebSocket(url)

        newWs.onopen = () => {
            setWs(newWs)
            isReconnectedRef.current = false
        }

        newWs.onclose = () => {
            if (!isReconnectedRef.current) {
                isReconnectedRef.current = true
                connect()
            }
        }

        newWs.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
    }, [isReconnectedRef.current, competitionId, ws])

    useEffect(() => {
        connect()

        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                console.log('close')
                ws.close()
            }
        }
    }, [competitionId])

    return { ws }
}

export type RatingRowsByBrigades = Record<number, RatingRow[]>

export interface RatingRow {
    confirmed: boolean
    confirmed_at: string | null
    deduction_element: number | null
    deduction_judge: number | null
    deduction_line: number | null
    has_shown: boolean
    participant: Participant
    participant_id: number
    rates: {
        'исполнение': Array<Rate | null>
        'артистичность': Array<Rate | null>
        'сложность': Array<Rate | null>
    }
}

export interface Rate {
    user_id: number
    rating_row_id: number
    rate: number
    user_role: UserRoleTitle
}

export interface WebSocketError {
    error: string
}