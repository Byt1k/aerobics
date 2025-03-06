import React, { useEffect, useState, useTransition } from 'react'
import { Competition, Participant, getParticipantsList, UploadParticipantsInput } from '@/entities/competition'
import tableStyles from '@/shared/ui/table/index.module.scss'

const CompetitionParticipants: React.FC<Props> = ({ competition }) => {
    const [tableState, setTableState] = useState<ParticipantsTable>({})
    const [nominations, setNominations] = useState<string[]>([])
    const [queues, setQueue] = useState<number[]>([])

    const [isPending, startTransition] = useTransition()

    const fetchParticipants = () => {
        startTransition(async () => {
            const result: ParticipantsTable = {} as ParticipantsTable

            const uniqQueues = new Set<number>()
            const uniqNominations = new Set<string>()

            try {
                const res = await getParticipantsList(competition.id)

                res.forEach(participant => {
                    uniqNominations.add(participant.nomination_shortened)
                    uniqQueues.add(participant.queue_index)
                })

                for (const queue of uniqQueues) {
                    result[queue] = {}

                    for (const nomination of uniqNominations) {
                        result[queue][nomination] = []
                    }
                }

                res.forEach(participant => {
                    result[participant.queue_index][participant.nomination_shortened].push(participant)
                })

                setTableState(result)
                setQueue(Array.from(uniqQueues))
                setNominations(Array.from(uniqNominations))
            } catch {
                //
            }
        })
    }

    useEffect(() => {
        fetchParticipants()
    }, [])

    const queueWithMaxNominationParticipants = (nomination: string): number => {
        let max = 0
        let queueResult = 0

        Object.keys(tableState).forEach(queueIndex => {
            if (tableState[+queueIndex][nomination].length > max) {
                max = tableState[+queueIndex][nomination].length
                queueResult = +queueIndex
            }
        })

        return queueResult
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2>Стартовый протокол</h2>
                {!Object.getOwnPropertyNames(tableState || {}).length && !isPending && (
                    <UploadParticipantsInput
                        competitionId={competition.id}
                        fetchParticipants={fetchParticipants}
                    />
                )}
            </div>
            <table className={tableStyles.table}>
                <thead>
                    <tr>
                        {Object.keys(tableState).map(queue => (
                            <td key={queue} className="text-center" colSpan={3}>
                                Бригада {queue}
                            </td>
                        )) }
                    </tr>
                </thead>
                <tbody>
                    {queues.map(() => nominations.map(nomination => (
                        <React.Fragment key={nomination}>
                            <tr>
                                {queues.map((_, i) => (
                                    <React.Fragment key={i}>
                                        <td />
                                        <td colSpan={2} className="font-medium">{nomination}</td>
                                    </React.Fragment>
                                ))}
                            </tr>
                            {tableState[queueWithMaxNominationParticipants(nomination)][nomination]
                                .map((_, participantIndex) => (
                                    <tr key={participantIndex}>
                                        {queues.map((queue, index) => {
                                            const participant = tableState[+queue][nomination][participantIndex]

                                            if (!participant) {
                                                return <td colSpan={3} />
                                            }

                                            return (
                                                <React.Fragment key={index}>
                                                    <td>{participant.order_num}</td>
                                                    <td>{participant.names}</td>
                                                    <td>{`${participant.country}, ${participant.city}`}</td>
                                                </React.Fragment>
                                            )
                                        })}
                                    </tr>
                                ))
                            }
                        </React.Fragment>
                    )))}
                </tbody>
            </table>
        </div>
    )
}

export default CompetitionParticipants

interface Props {
    competition: Competition
}

type ParticipantsTable = Record<number, ParticipantQueue>
type ParticipantQueue = Record<string, Participant[]>