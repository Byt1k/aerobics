import React, { useEffect, useState } from 'react'
import { useWebSocket, RatingRowsByBrigades } from '@/kernel/ws'
import { Competition, CompetitionRatesTable } from '@/entities/competition'
import { useCurrentUser } from '@/entities/user'
import { toast } from 'react-toastify'

const CompetitionRatings: React.FC<Props> = ({ competition }) => {
    const { ws } = useWebSocket(competition.id)
    const [tableData, setTableData] = useState<RatingRowsByBrigades>({})
    const currentUser = useCurrentUser()

    useEffect(() => {
        if (!ws) return

        ws.onmessage = (e) => {
            console.log(JSON.parse(e.data))
            const data = JSON.parse(e.data) // as { rating_rows_by_brigades: RatingRowsByBrigades } | WebSocketError

            if (data.error) {
                toast.error(data.error)
                return
            }

            setTableData(data.rating_rows_by_brigades)
        }
    }, [ws])

    const changeRate = (payload: ChangeRatePayload) => {
        ws?.send(JSON.stringify(payload))
    }

    const changeDeductions = (payload: ChangeDeductionsPayload) => {
        ws?.send(JSON.stringify(payload))
    }

    return (
        <div className={`grid grid-cols-${Object.keys(tableData).length} gap-3`}>
            {Object.entries(tableData).map(([queue, rows]) => (
                <CompetitionRatesTable
                    key={queue}
                    queue={+queue}
                    rows={rows}
                    competitionId={competition.id}
                    changeRate={currentUser.is_admin ? changeRate : undefined}
                    changeDeductions={changeDeductions}
                />
            ))}
        </div>
    )
}

export default CompetitionRatings

interface Props {
    competition: Competition
}

interface ChangeRatePayload {
    participant_id: number
    judge_id: number
    rate: number
}

interface ChangeDeductionsPayload {
    participant_id: number
    deduction_line: number,
    deduction_element: number
    deduction_judge: number
}
