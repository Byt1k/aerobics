import React, { useEffect, useState } from 'react'
import {
    Competition,
    Participant,
    getParticipantsList,
    UploadParticipantsInput,
    ParticipantNameEditorPopup,
} from '@/entities/competition'
import tableStyles from '@/shared/ui/table/index.module.scss'
import { ParticipantRowsList } from './ui/participant-rows-list'

const CompetitionParticipants: React.FC<Props> = ({ competition }) => {
    const [list, setList] = useState<Participant[]>([])
    const [tableState, setTableState] = useState<ParticipantsTable>({})
    const [nominations, setNominations] = useState<string[]>([])
    const [queues, setQueue] = useState<number[]>([])
    const [cities, setCities] = useState<string[]>([])

    const fetchParticipants = async () => {
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

            const queues = Array.from(uniqQueues).sort()

            for (const queue of queues) {
                result[queue] = []
            }

            res.forEach(participant => {
                result[participant.queue_index].push(participant)
            })

            setList(res)
            setTableState(result)
            setQueue(queues)
            setNominations(Array.from(uniqNominations))
            setCities(Array.from(uniqCities))
        } catch {
            //
        }
    }

    useEffect(() => {
        fetchParticipants()
    }, [])

    const [nameEditorOpened, setNameEditorOpened] = useState(false)
    const [selectedParticipant, setSelectedParticipant] = useState<Participant>()

    const openParticipantNameEditor = (participant: Participant) => {
        setSelectedParticipant(participant)
        setNameEditorOpened(true)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4 gap-5">
                <h2>Участники</h2>

                {competition.status === 'not_started' && (
                    <UploadParticipantsInput
                        competitionId={competition.id}
                        fetchParticipants={fetchParticipants}
                        className="ml-auto"
                    />
                )}
                {!!Object.getOwnPropertyNames(tableState || {}).length && (
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
                                <td colSpan={4} className="text-center">
                                    <h3>Бригада {queue}</h3>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <ParticipantRowsList
                                competitionId={competition.id}
                                participants={tableState[queue]}
                                fetchParticipants={fetchParticipants}
                                openParticipantNameEditor={openParticipantNameEditor}
                            />
                        </tbody>
                    </table>
                ))}
            </div>

            {selectedParticipant && (
                <ParticipantNameEditorPopup
                    active={nameEditorOpened}
                    setActive={setNameEditorOpened}
                    participant={selectedParticipant}
                    updateParticipants={fetchParticipants}
                />
            )}
        </div>
    )
}

export default CompetitionParticipants

interface Props {
    competition: Competition
}

type ParticipantsTable = Record<number, Participant[]>
