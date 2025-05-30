import React, { useEffect, useState } from 'react'
import s from './index.module.scss'
import { UserRoleAndQueueByCompetition, Competition } from '@/entities/competition'
import Button from '@/shared/ui/button'
import { useWebSocket, RatingRow, RatingRowsByBrigades, Rate } from '@/kernel/ws'
import { useCurrentUser, userRolesList } from '@/entities/user'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import { trimText } from '@/shared/lib/trim-text'
import { Keyboard } from '@/shared/ui/keyboard'

export const RateInputField: React.FC<Props> = ({ refereeRoleAndQueue, competition, isPending }) => {
    const currentUser = useCurrentUser()
    const { ws } = useWebSocket(competition.id)
    const [currentRow, setCurrentRow] = useState<RatingRow | null>(null)
    const [rate, setRate] = useState('')
    const [rateIsFixed, setRateIsFixed] = useState(false)

    useEffect(() => {
        if (!ws) return

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            console.log(data)

            if (data.error) {
                toast.error(data.error)
                return
            }

            const rows = (data.rating_rows_by_brigades as RatingRowsByBrigades)[refereeRoleAndQueue.queue_index]
            const current = rows.find(row => !row.confirmed)

            setCurrentRow(current ?? null)

            if (!current) return

            const allRates: Array<Rate | null> = []

            Object.entries(current.rates).forEach(([, rates]) => {
                allRates.push(...rates)
            })

            const currentRate = allRates.find(r => r?.user_id === currentUser?.id)

            if (currentRate) {
                setRateIsFixed(true)
                setRate(currentRate.rate.toString())
            } else if (rateIsFixed) {
                setRateIsFixed(false)
                setRate('')
            }
        }
    }, [ws, rateIsFixed, currentUser, refereeRoleAndQueue])


    const sendRate = () => {
        if (!currentRow) return

        if (rate === '') {
            toast.error('Укажите оценку')
            return
        }

        if (rate.length > 3) {
            toast.error('Некорректная оценка')
            return
        }

        if (refereeRoleAndQueue.role.id === userRolesList['сложность судья'] && +rate < 0) {
            toast.error('Некорректная оценка')
            return
        } else if (+rate < 0 || +rate > 10) {
            toast.error('Некорректная оценка')
            return
        }

        const payload = {
            participant_id: currentRow.participant_id,
            rate: +rate
        }

        ws?.send(JSON.stringify(payload))
    }

    if (isPending) {
        return 'Загрузка...'
    }

    if (!competition && !isPending) {
        return 'Соревнование не найдено'
    }

    if (competition.status === 'not_started') {
        return 'Соревнование не началось'
    }

    if (competition.status === 'finished') {
        return 'Соревнование завершилось'
    }

    // if (!currentRow) {
    //     return 'Все участники выступили'
    // }

    return (
        <div className={s.wrapper}>
            <div className={s.grid}>
                <div className="font-bold text-center">{refereeRoleAndQueue.role.title}</div>
                <div className={s.head}>
                    <h2>{trimText(currentRow?.participant.names ?? '', 40)}</h2>
                    <h4>{currentRow?.participant.nomination_shortened}</h4>
                </div>
                <div className={classNames(s.field, { [s.fixed]: rateIsFixed })}>
                    {rate || <span className={s.placeholder}>Введите оценку</span>}
                </div>
                <Keyboard setValue={setRate} disabled={rateIsFixed} />
            </div>
            <Button className={s.btn} onClick={sendRate} disabled={rateIsFixed || !currentRow}>
                {rateIsFixed ? 'Оценка зафиксирована' : 'Зафиксировать'}
            </Button>
        </div>
    )
}

interface Props {
    refereeRoleAndQueue: UserRoleAndQueueByCompetition
    competition: Competition
    isPending: boolean
}