import React, { useEffect, useState } from 'react'
import { Competition, UserRoleAndQueueByCompetition, CompetitionRatesTable } from '@/entities/competition'
import { useWebSocket,  RatingRow } from '@/kernel/ws'
import s from './index.module.scss'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { toast } from 'react-toastify'

export const ArbitratorModule: React.FC<Props> = ({ competition, refereeRoleAndQueue, isPending }) => {
    const { ws } = useWebSocket(competition.id)
    const [rows, setRows] = useState<RatingRow[]>([])

    const [currentRow, setCurrentRow] = useState<RatingRow | null>(null)

    const [deductionLine, setDeductionLine] = useState('0')
    const [deductionElement, setDeductionElement] = useState('0')
    const [deductionJudge, setDeductionJudge] = useState('0')
    const [deductionIsFixed, setDeductionIsFixed] = useState(false)

    const [translationQueue, setTranslationQueue] = useState<number[]>([])

    useEffect(() => {
        if (!ws) return

        ws.onmessage = (e) => {
            console.log(JSON.parse(e.data))

            const message = JSON.parse(e.data)

            if (message.error) {
                toast.error(message.error)
                return
            }

            const translation = message.translation_numbers as number[]
            setTranslationQueue(translation ?? [])

            const data = message.rating_rows_by_brigades[refereeRoleAndQueue.queue_index] as RatingRow[]
            const current = data.find(r => !r.confirmed)

            setRows(data)
            setCurrentRow(current ?? null)

            setDeductionLine(current?.deduction_line?.toString() ?? '')
            setDeductionElement(current?.deduction_element?.toString() ?? '')
            setDeductionJudge(current?.deduction_judge?.toString() ?? '')

            if ([current?.deduction_line, current?.deduction_element, current?.deduction_judge].every(item => item !== null)) {
                setDeductionIsFixed(true)
            }

        }
    }, [ws])

    const saveDeductions = () => {
        if (!currentRow) return

        if ([deductionLine, deductionElement, deductionJudge].includes('')) {
            toast.error('Заполните все поля')
            return
        }

        if ([deductionLine, deductionElement, deductionJudge].some(value => value.length > 3 || +value < 0)) {
            toast.error('Некорректные данные')
            return
        }

        const payload = {
            participant_id: currentRow.participant_id,
            deduction_line: +deductionLine,
            deduction_element: +deductionElement,
            deduction_judge: +deductionJudge
        }

        ws?.send(JSON.stringify(payload))
    }

    const confirm = () => {
        if (!currentRow) return

        const payload = {
            participant_id: currentRow.participant_id,
            confirmed: true
        }

        ws?.send(JSON.stringify(payload))
    }

    const unconfirm = (participantId: number) => {
        if (!currentRow) return

        const payload = {
            participant_id: participantId,
            confirmed: false
        }

        ws?.send(JSON.stringify(payload))
    }

    const show = (participantOrderNum: number) => {
        if (!currentRow) return

        const payload = {
            add_number_translation: participantOrderNum,
        }

        ws?.send(JSON.stringify(payload))
    }

    const declinedRate = (userId: number) => {
        if (!currentRow) return

        const payload = {
            participant_id: currentRow.participant_id,
            judge_id: userId
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

    return (
       <div className="flex flex-col gap-6">
           <CompetitionRatesTable
               queue={refereeRoleAndQueue.queue_index}
               rows={rows}
               declinedRate={declinedRate}
               competitionId={competition.id}
               unconfirmParticipant={unconfirm}
               showParticipant={show}
               translationQueue={translationQueue}
           />
           {!!currentRow && (
               <div className="flex flex-col gap-4 bg-white p-8 rounded-3xl sticky bottom-0">
                   <table className={s.deductionsTable}>
                       <thead>
                       <tr>
                           <td rowSpan={2}>Сбавки</td>
                           <td>Сбавка за линию</td>
                           <td>Сбавка за элемент</td>
                           <td>Сбавка главного судьи</td>
                       </tr>
                       <tr>
                           <td>
                               <Input
                                   type="number"
                                   value={deductionLine}
                                   onChange={setDeductionLine}
                                   placeholder="Введите значение"
                               />
                           </td>
                           <td>
                               <Input
                                   type="number"
                                   value={deductionElement}
                                   onChange={setDeductionElement}
                                   placeholder="Введите значение"
                               />
                           </td>
                           <td>
                               <Input
                                   type="number"
                                   value={deductionJudge}
                                   onChange={setDeductionJudge}
                                   placeholder="Введите значение"
                               />
                           </td>
                       </tr>
                       </thead>
                   </table>
                   <div className="grid grid-cols-2 gap-4">
                       <Button variant="secondary" onClick={saveDeductions}>Сохранить</Button>
                       <Button onClick={confirm} disabled={!deductionIsFixed}>
                           Зафиксировать и перейти к следующему участнику
                       </Button>
                   </div>
               </div>
           )}
       </div>
    )
}

interface Props {
    refereeRoleAndQueue: UserRoleAndQueueByCompetition
    competition: Competition
    isPending: boolean
}