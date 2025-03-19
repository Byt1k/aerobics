import React, { useEffect, useState } from 'react'
import s from './index.module.scss'
import Input from '@/shared/ui/input'
import { UserRoleAndQueueByCompetition, Competition } from '@/entities/competition'
import Button from '@/shared/ui/button'
import { useWebSocket, RatingRow, RatingRowsByBrigades, Rate } from '@/kernel/ws'
import { useCurrentUser } from '@/entities/user'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import { userRolesList } from '../../../../entities/user'

export const RateInputField: React.FC<Props> = ({ refereeRoleAndQueue, competition }) => {
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
            } else {
                setRateIsFixed(false)
                setRate('')
            }
        }
    }, [ws])


    const sendRate = () => {
        if (!currentRow) return

        if (rate.length > 3) {
            toast.error('Некорректная оценка')
            return
        }

        if (refereeRoleAndQueue.role.id === userRolesList['сложность судья'] && +rate < 0) {
            toast.error('Некорректная оценка')
            return
        } else if (+rate < 5 || +rate > 10) {
            toast.error('Некорректная оценка')
            return
        }

        const payload = {
            participant_id: currentRow.participant_id,
            rate: +rate
        }

        ws?.send(JSON.stringify(payload))
    }

    if (!currentRow) {
        return 'Все участники выступили'
    }

    return (
        <div className={s.wrapper}>
            <div className={s.grid}>
                <div className="font-bold">Текущий участник</div>
                <div className="font-bold">{refereeRoleAndQueue.role.title}</div>
                <div>
                    <h2>{currentRow.participant.names}</h2>
                    <h4>{currentRow.participant.nomination_shortened}</h4>
                </div>
                <div>
                    <Input
                        placeholder="Введите оценку"
                        type="number"
                        value={rate}
                        onChange={setRate}
                        className={classNames(s.field, { [s.fixed]: rateIsFixed })}
                        disabled={rateIsFixed}
                    />
                </div>
            </div>
            <Button className={s.btn} onClick={sendRate} disabled={rateIsFixed}>
                Зафиксировать
            </Button>
        </div>
    )
}

interface Props {
    refereeRoleAndQueue: UserRoleAndQueueByCompetition
    competition: Competition
}