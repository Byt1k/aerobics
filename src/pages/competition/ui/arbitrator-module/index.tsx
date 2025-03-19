import React, { useEffect, useState } from 'react'
import { Competition, UserRoleAndQueueByCompetition, CompetitionRatesTable } from '@/entities/competition'
import { useWebSocket,  RatingRow } from '@/kernel/ws'
import s from './index.module.scss'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { toast } from 'react-toastify'

export const ArbitratorModule: React.FC<Props> = ({ competition, refereeRoleAndQueue }) => {
    const { ws } = useWebSocket(competition.id)
    const [nominationsWithAgeGroup, setNominationsWithAgeGroup] = useState<Set<string>>(new Set())
    const [rows, setRows] = useState<RatingRow[]>([])

    const [currentRow, setCurrentRow] = useState<RatingRow | null>(null)

    const [deductionLine, setDeductionLine] = useState('')
    const [deductionElement, setDeductionElement] = useState('')
    const [deductionJudge, setDeductionJudge] = useState('')
    const [deductionIsFixed, setDeductionIsFixed] = useState(false)

    useEffect(() => {
        if (!ws) return

        ws.onmessage = (e) => {
            console.log(JSON.parse(e.data))

            const message = JSON.parse(e.data)

            if (message.error) {
                toast.error(message.error)
                return
            }

            const data = message.rating_rows_by_brigades[refereeRoleAndQueue.queue_index] as RatingRow[]

            const uniqNominations: Set<string> = new Set()

            data.forEach(row => {
                const nominationWithAgeGroup = `${row.participant.nomination} | ${row.participant.age_group}`
                uniqNominations.add(nominationWithAgeGroup)
            })

            const current = data.find(r => !r.confirmed)

            setNominationsWithAgeGroup(uniqNominations)
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

    const declinedRate = (userId: number) => {
        if (!currentRow) return

        const payload = {
            participant_id: currentRow.participant_id,
            judge_id: userId
        }

        ws?.send(JSON.stringify(payload))
    }

    return (
       <div className="flex flex-col gap-6">
           <CompetitionRatesTable
               queue={refereeRoleAndQueue.queue_index}
               rows={rows}
               nominationsWithAgeGroup={nominationsWithAgeGroup}
               declinedRate={declinedRate}
               competitionId={competition.id}
           />
           {!!currentRow && (
               <div className="flex flex-col gap-4 bg-white p-8 rounded-3xl">
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
}