import React, { useEffect, useState, useTransition } from 'react'
import { Competition, Participant, getParticipantsList, UploadParticipantsInput } from '@/entities/competition'
import tableStyles from '@/shared/ui/table/index.module.scss'

const CompetitionParticipants: React.FC<Props> = ({ competition }) => {
    const [list, setList] = useState<Participant[]>([])
    const [tableState, setTableState] = useState<ParticipantsTable>({})
    const [nominations, setNominations] = useState<string[]>([])
    const [queues, setQueue] = useState<number[]>([])
    const [cities, setCities] = useState<string[]>([])

    const [isPending, startTransition] = useTransition()

    const fetchParticipants = () => {
        startTransition(async () => {
            const result: ParticipantsTable = {} as ParticipantsTable

            const uniqQueues = new Set<number>()
            const uniqNominations = new Set<string>()
            const uniqCities = new Set<string>()

            try {
                const res = await getParticipantsList(competition.id)

                res.forEach(participant => {
                    uniqNominations.add(participant.nomination_shortened)
                    uniqQueues.add(participant.queue_index)
                    uniqCities.add(participant.city)
                })

                for (const queue of uniqQueues) {
                    result[queue] = []
                }

                res.forEach(participant => {
                    result[participant.queue_index].push(participant)
                })

                setList(res)
                setTableState(result)
                setQueue(Array.from(uniqQueues))
                setNominations(Array.from(uniqNominations))
                setCities(Array.from(uniqCities))
            } catch {
                //
            }
        })
    }

    useEffect(() => {
        fetchParticipants()
    }, [])

    const queueWithMaxParticipants = (): number => {
        let max = 0
        let queueResult = 0

        Object.keys(tableState).forEach(queueIndex => {
            if (tableState[+queueIndex].length > max) {
                max = tableState[+queueIndex].length
                queueResult = +queueIndex
            }
        })

        return queueResult
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2>Стартовый протокол</h2>
                {!Object.getOwnPropertyNames(tableState || {}).length && !isPending ? (
                    <UploadParticipantsInput
                        competitionId={competition.id}
                        fetchParticipants={fetchParticipants}
                    />
                ) : (
                    <div className="flex gap-3">
                        <div className="flex flex-col gap-1 bg-white p-3 rounded">
                            <p>Номинаций</p>
                            <h2>{nominations.length}</h2>
                        </div>
                        <div className="flex flex-col gap-1 bg-white p-3 rounded">
                            <p>Участников</p>
                            <h2>{list.length}</h2>
                        </div>
                        <div className="flex flex-col gap-1 bg-white p-3 rounded">
                            <p>Городов/Школ</p>
                            <h2>{cities.length}</h2>
                        </div>
                    </div>
                )}
            </div>
            <table className={tableStyles.table}>
                <thead>
                <tr>
                        {Object.keys(tableState).map(queue => (
                            <td key={queue} className="text-center" colSpan={4}>
                                Бригада {queue}
                            </td>
                        )) }
                    </tr>
                </thead>
                <tbody>
                    {tableState[queueWithMaxParticipants()]?.map((_, participantIndex) => (
                        <tr key={'row-' + participantIndex}>
                            {queues.map(queue => {
                                const participant = tableState[+queue][participantIndex]

                                if (!participant) {
                                    return <td key={participantIndex} colSpan={4} />
                                }

                                return (
                                    <React.Fragment key={participantIndex}>
                                        <td>{participant.order_num}</td>
                                        <td className="whitespace-pre-wrap">{participant.names}</td>
                                        <td className="whitespace-nowrap">{participant.nomination_shortened}</td>
                                        <td>{`${participant.country}, ${participant.city}`}</td>
                                    </React.Fragment>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default CompetitionParticipants

interface Props {
    competition: Competition
}

type ParticipantsTable = Record<number, Participant[]>
