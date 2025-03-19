import React, { useEffect, useState } from 'react'
import { Competition } from '@/entities/competition'
import { useWebSocket, RatingRowsByBrigades } from '@/kernel/ws'
import { CompetitionRatesTable } from '@/entities/competition'

const CompetitionRatings: React.FC<Props> = ({ competition }) => {
    const { ws } = useWebSocket(competition.id)
    const [tableData, setTableData] = useState<RatingRowsByBrigades>({})

    useEffect(() => {
        if (!ws) return

        ws.onmessage = (e) => {
            console.log(JSON.parse(e.data))
            const data = JSON.parse(e.data).rating_rows_by_brigades as RatingRowsByBrigades
            setTableData(data)
        }
    }, [ws])



    return (
        <div className="grid grid-cols-2 gap-3">
            {Object.entries(tableData).map(([queue, rows]) => (
                <CompetitionRatesTable
                    key={queue}
                    queue={+queue}
                    rows={rows}
                    competitionId={competition.id}
                />
            ))}
        </div>
    )
}

export default CompetitionRatings

interface Props {
    competition: Competition
}
