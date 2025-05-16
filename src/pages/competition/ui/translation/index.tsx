import React, { useEffect, useRef, useState } from 'react'
import { Competition } from '@/entities/competition'
import { RatingRow, RatingRowsByBrigades, useWebSocket, WebSocketError } from '@/kernel/ws'
import { toast } from 'react-toastify'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import {
    calculateTotalDeductions,
    calculateTotalExecutionOrArtistry,
    calculateTotalRate,
} from '@/shared/lib/calculateTotalRate'
import s from './index.module.scss'
import Button from '@/shared/ui/button'
import { useLeaderboard } from '@/shared/lib/use-leaderboard'

export const Translation: React.FC<IProps> = ({ competition }) => {
    const { ws } = useWebSocket(competition.id)
    const [allRows, setAllRows] = useState<RatingRow[]>([])

    const swiperRef = useRef<SwiperRef>(null)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

    const goToSlide = (index: number) => {
        if (swiperRef.current) {
            swiperRef.current.swiper.slideToLoop(index)
        }
    }

    useEffect(() => {
        if (currentSlideIndex === allRows.length - 2) {
            goToSlide(allRows.length - 1)
        }
    }, [allRows])

    useEffect(() => {
        if (!ws) return

        ws.onmessage = (e) => {
            console.log(JSON.parse(e.data))
            const data = JSON.parse(e.data) as { rating_rows_by_brigades: RatingRowsByBrigades } | WebSocketError

            if ((data as WebSocketError).error) {
                toast.error((data as WebSocketError).error)
                return
            }

            const result = (data as { rating_rows_by_brigades: RatingRowsByBrigades }).rating_rows_by_brigades as RatingRowsByBrigades

            const confirmedRows = Object.values(result).flatMap(queue =>
                queue.filter(row => row.confirmed)
            )

            confirmedRows.sort((a, b) =>
                new Date(a.confirmed_at ?? '').getTime() - new Date(b.confirmed_at ?? '').getTime()
            )

            setAllRows(confirmedRows)
        }
    }, [ws])

    const { getParticipantPlace } = useLeaderboard(allRows)

    return (
        <div className={s.wrapper}>
            <Swiper
                ref={swiperRef}
                spaceBetween={50}
                slidesPerView={1}
                navigation
                pagination
                onSlideChange={({ realIndex }) => setCurrentSlideIndex(realIndex)}
            >
                {allRows.map((row, i) => (
                    <SwiperSlide key={row.participant.id}>
                        <div className="flex gap-2">
                            <h2>{i + 1}.</h2>
                            <div>
                                <h2>{row.participant.names}</h2>
                                <p className="mt-2">{row.participant.nomination_shortened}</p>
                            </div>
                        </div>
                        <div className={s.result}>
                            <div className={s.rates}>
                                <p>Исполнение: <b>{calculateTotalExecutionOrArtistry(row.rates['исполнение'])?.toFixed(2)}</b></p>
                                <p>Артистичность: <b>{calculateTotalExecutionOrArtistry(row.rates['артистичность'])?.toFixed(2)}</b></p>
                                {row.rates['сложность'][0]?.rate && <p>Сложность: <b>{(row.rates['сложность'][0]?.rate / 2).toFixed(2)}</b></p>}
                                <p>Сбавки: <b>{calculateTotalDeductions(row)?.toFixed(2)}</b></p>
                                <h2>Итоговая оценка: {calculateTotalRate(row)?.toFixed(2)}</h2>
                            </div>
                            <div className={s.place}>
                                <h2>Место</h2>
                                <p>
                                    {getParticipantPlace(row.participant.nomination_shortened, row.participant.id)}
                                </p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}

                <div className={s.navigation}>
                    <Button
                        variant={"transparent"}
                        disabled={currentSlideIndex === 0}
                        onClick={() => goToSlide(currentSlideIndex - 1)}
                    >
                        Предыдущий участник
                    </Button>
                    <Button
                        variant={"transparent"}
                        disabled={currentSlideIndex === allRows.length - 1}
                        onClick={() => goToSlide(currentSlideIndex + 1)}
                    >
                        Следующий участник
                    </Button>
                </div>
            </Swiper>
        </div>
    )
}

interface IProps {
    competition: Competition
}