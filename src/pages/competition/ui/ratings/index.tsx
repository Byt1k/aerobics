import React, { useEffect, useState } from 'react'
import { Competition } from '@/entities/competition'
import { useWebSocket, RatingRowsByBrigades } from '@/kernel/ws'
import { CompetitionRatesTable } from '@/entities/competition'

const CompetitionRatings: React.FC<Props> = ({ competition }) => {
    const { ws } = useWebSocket(competition.id)
    const [nominationsWithAgeGroup, setNominationsWithAgeGroup] = useState<
        NominationsByBrigades
    >({}) // `${nomination} | ${age_group}`
    const [tableData, setTableData] = useState<RatingRowsByBrigades>({})

    useEffect(() => {
        if (!ws) return

        ws.onmessage = (e) => {
            console.log(JSON.parse(e.data))
            const data = JSON.parse(e.data).rating_rows_by_brigades as RatingRowsByBrigades

            const uniqNominations: NominationsByBrigades = {}

            Object.entries(data).forEach(([queue, rows]) => {
                rows.forEach(row => {
                    const nominationWithAgeGroup = `${row.participant.nomination} | ${row.participant.age_group}`

                    if (uniqNominations[+queue]) {
                        uniqNominations[+queue].add(nominationWithAgeGroup)
                    } else {
                        uniqNominations[+queue] = new Set([nominationWithAgeGroup])
                    }
                })
            })

            setNominationsWithAgeGroup(uniqNominations)
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
                    nominationsWithAgeGroup={nominationsWithAgeGroup[+queue]}
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

type NominationsByBrigades = Record<number, Set<string>>
