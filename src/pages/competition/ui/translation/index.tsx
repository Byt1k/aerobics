import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Competition } from '@/entities/competition'
import { RatingRow, RatingRowsByBrigades, useWebSocket, WebSocketError } from '@/kernel/ws'
import { toast } from 'react-toastify'
import {
    calculateTotalDeductions,
    calculateTotalExecutionOrArtistry,
    calculateTotalRate,
} from '@/shared/lib/calculateTotalRate'
import s from './index.module.scss'
import { useLeaderboard } from '@/shared/lib/use-leaderboard'
import { trimText } from '@/shared/lib/trim-text'

const MIN_SHOW_TIME = 30 // секунд

export const Translation: React.FC<IProps> = ({ competition }) => {
    const { ws } = useWebSocket(competition.id)
    const [confirmedParticipants, setaConfirmedParticipants] = useState<RatingRow[]>([])

    const [currentParticipant, setCurrentParticipant] = useState<RatingRow>()
    const [translationQueue, setTranslationQueue] = useState<number[]>([])
    const [showTime, setShowTime] = useState(MIN_SHOW_TIME)

    const participantShown = useCallback((participantOrderNum: number) => {
        const payload = {
            remove_number_translation: participantOrderNum,
        }

        ws?.send(JSON.stringify(payload))
    }, [ws])

    useEffect(() => {
        if (!ws) return

        ws.onmessage = (e) => {
            console.log(JSON.parse(e.data))
            const data = JSON.parse(e.data) as { rating_rows_by_brigades: RatingRowsByBrigades; translation_numbers: number[] } | WebSocketError

            if ((data as WebSocketError).error) {
                toast.error((data as WebSocketError).error)
                return
            }

            const { rating_rows_by_brigades, translation_numbers } = (data as { rating_rows_by_brigades: RatingRowsByBrigades; translation_numbers: number[] })

            const confirmedRows = Object.values(rating_rows_by_brigades).flatMap(queue =>
                queue.filter(row => row.confirmed)
            )

            confirmedRows.sort((a, b) =>
                new Date(a.confirmed_at ?? '').getTime() - new Date(b.confirmed_at ?? '').getTime()
            )

            setaConfirmedParticipants(confirmedRows)
            setTranslationQueue(translation_numbers)
        }
    }, [ws])

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (confirmedParticipants.length && translationQueue.length && showTime >= MIN_SHOW_TIME) {
            const queue = translationQueue.filter(num => currentParticipant?.participant.order_num !== num)

            const nextParticipant = confirmedParticipants
                .find(r => !r.has_shown && r.participant.order_num === queue[0])

            if (!nextParticipant) {
                return
            }

            if (currentParticipant) {
                participantShown(currentParticipant.participant.order_num)
            }

            if (timerRef.current) {
                clearInterval(timerRef.current)
            }

            setShowTime(0)
            timerRef.current = setInterval(() => {
                setShowTime(prev => prev + 1)
            }, 1000)

            setCurrentParticipant(nextParticipant)
        }
    }, [translationQueue, confirmedParticipants, showTime, currentParticipant, participantShown])

    const { getParticipantPlace } = useLeaderboard(confirmedParticipants)

    // фиксация места участника на время показа
    const currentParticipantPlace = useMemo(() => {
        if (!currentParticipant) return

        return getParticipantPlace(
            currentParticipant.participant.nomination_shortened,
            currentParticipant.participant.id,
        )
        // eslint-disable-next-line
    }, [currentParticipant?.participant.id])

    if (!currentParticipant) return

    return (
        <div className={s.wrapper}>
            <div className="flex gap-2">
                <h1>{currentParticipant.participant.order_num}.</h1>
                <div>
                    <h1>{trimText(currentParticipant.participant.names, 45)}</h1>
                    <h2 className="mt-2">{currentParticipant.participant.nomination_shortened}</h2>
                </div>
            </div>
            <table className={s.table}>
                <tr>
                    <td>
                        <p>Исп</p>
                        <b>{calculateTotalExecutionOrArtistry(currentParticipant.rates['исполнение'])?.toFixed(2)}</b>
                    </td>
                    <td>
                        <p>Арт</p>
                        <b>{calculateTotalExecutionOrArtistry(currentParticipant.rates['артистичность'])?.toFixed(2)}</b>
                    </td>
                    <td>
                        <p>Сл</p>
                        <b>{(currentParticipant.rates['сложность'][0]?.rate ?? 0 / 2).toFixed(2)}</b>
                    </td>
                    <td>
                        <p>Сб</p>
                        <b>{calculateTotalDeductions(currentParticipant)?.toFixed(2)}</b>
                    </td>
                    <td rowSpan={2} className={s.place}>
                        <h2>Место</h2>
                        <p>
                            {currentParticipantPlace}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={4}>
                        <div className={s.total}>
                            <h2>Итоговая оценка:</h2>
                            <h1>{calculateTotalRate(currentParticipant)?.toFixed(2)}</h1>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    )
}

interface IProps {
    competition: Competition
}