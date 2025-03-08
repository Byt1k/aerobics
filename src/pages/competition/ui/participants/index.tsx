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
                    result[queue] = {}

                    for (const nomination of uniqNominations) {
                        result[queue][nomination] = []
                    }
                }

                res.forEach(participant => {
                    result[participant.queue_index][participant.nomination_shortened].push(participant)
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

            <div className="flex gap-3">
                {queues.map(queue => (
                    <table className={tableStyles.table} key={queue}>
                        <thead>
                            <tr>
                                <td colSpan={3} className="text-center">
                                    <h3>Бригада {queue}</h3>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(tableState[queue]).map(([nomination, participants]) => {
                                if (participants.length) {
                                    return (
                                        <React.Fragment key={nomination}>
                                            <tr>
                                                <td colSpan={3} className="text-center font-bold">{nomination}</td>
                                            </tr>
                                            {participants.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.order_num}</td>
                                                    <td className="whitespace-pre-wrap">{p.names}</td>
                                                    <td>{`${p.country}, ${p.city}`}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    )
                                }

                                return null
                            })}
                        </tbody>
                    </table>
                )) }
            </div>
        </div>
    )
}

export default CompetitionParticipants

interface Props {
    competition: Competition
}

type ParticipantsTable = Record<number, ParticipantsQueue>
type ParticipantsQueue = Record<string, Participant[]>
