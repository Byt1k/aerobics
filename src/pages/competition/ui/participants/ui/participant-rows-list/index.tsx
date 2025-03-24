/* eslint-disable @typescript-eslint/ban-ts-comment */

import classNames from 'classnames'
import s from './index.module.scss'
import { Popconfirm } from 'antd'
import React, { DragEventHandler, useOptimistic, useState, useTransition } from 'react'
import { Participant, deleteCompetitionParticipant, moveParticipant } from '@/entities/competition'
import { toast } from 'react-toastify'
import { svgIcons } from '@/shared/lib/svgIcons'
import { moveNomination } from '../../../../../../entities/competition'

export const ParticipantRowsList: React.FC<Props> = ({
    competitionId,
    participants,
    fetchParticipants,
    openParticipantNameEditor,
}) => {
    const [isDeleting, startDeleting] = useTransition()

    const deleteParticipant = (id: number) => {
        startDeleting(async () => {
            try {
                await deleteCompetitionParticipant(id)
                await fetchParticipants()
                toast.success('Изменения сохранены')
            } catch {
                toast.error('Не удалось сохранить изменения')
            }
        })
    }

    const [optimisticParticipants, optimisticMoveParticipant] = useOptimistic(
        participants,
        (list, { currentOrder, newOrder }: {currentOrder: number; newOrder: number}) => {
            const newRows = [...list]

            const currentIndex = newRows.findIndex(p => p.order_num === currentOrder)
            const newIndex = newRows.findIndex(p => p.order_num === newOrder)

            const [draggedRow] = newRows.splice(currentIndex, 1)
            newRows.splice(newIndex, 0, draggedRow)


            return newRows
        }
    )

    const [selectedDrag, setSelectedDrag] = useState<'nomination' | 'participant' | null>(null)

    const [isMovingParticipant, startMovingParticipant] = useTransition()

    const saveMovingParticipant = (currentOrder: number, newOrder: number) => {
        startMovingParticipant(async () => {
            optimisticMoveParticipant({ currentOrder, newOrder })

            try {
                await moveParticipant(competitionId, {
                    participant_order_num: currentOrder,
                    new_participant_order_num: newOrder,
                })
                await fetchParticipants()
                toast.success('Изменения сохранены')
            } catch {
                toast.error('Не удалось сохранить изменения')
            }
        })
    }

    const handleParticipantDragStart: DragEventHandler<HTMLTableRowElement> = (e) => {
        // @ts-ignore
        e.dataTransfer.setData('text/plain', e.target.dataset.order);
        setSelectedDrag('participant')
    }

    const handleParticipantDragOver: DragEventHandler<HTMLTableRowElement> = (e) => {
        if (selectedDrag !== 'participant') return

        e.preventDefault()
        // @ts-ignore
        e.target.closest('tr').style.background = '#d6ffd6'
    }

    const handleParticipantDragLeave: DragEventHandler<HTMLTableRowElement> = (e) => {
        if (selectedDrag !== 'participant') return

        // @ts-ignore
        e.target.closest('tr').style.background = '#fff'
    }

    const handleParticipantDrop: DragEventHandler<HTMLTableRowElement> = (e) => {
        if (selectedDrag !== 'participant') return

        const dragOrder = e.dataTransfer.getData('text/plain')
        // @ts-ignore
        const dropOrder = e.target.closest('tr').dataset.order
        // @ts-ignore
        e.target.closest('tr').style.background = '#fff'

        if (dragOrder === dropOrder) return

        saveMovingParticipant(+dragOrder, +dropOrder)
        setSelectedDrag(null)
    }


    const [isMovingNomination, startMovingNomination] = useTransition()

    const saveMovingNomination = (currentStartOrder: number, newStartOrder: number) => {
        startMovingNomination(async () => {
            // optimisticMoveParticipant({ currentOrder, newOrder })

            try {
                await moveNomination(competitionId, {
                    nomination_start_order_num: currentStartOrder,
                    new_start_order_num: newStartOrder,
                })
                await fetchParticipants()
                toast.success('Изменения сохранены')
            } catch {
                toast.error('Не удалось сохранить изменения')
            }
        })
    }

    const handleNominationDragStart: DragEventHandler<HTMLTableRowElement> = (e) => {
        // @ts-ignore
        e.dataTransfer.setData('text/plain', e.target.dataset.order)
        setSelectedDrag('nomination')
    }

    const handleNominationDragOver: DragEventHandler<HTMLTableRowElement> = (e) => {
        if (selectedDrag !== 'nomination') return

        e.preventDefault()
        // @ts-ignore
        e.target.closest('tr').style.background = '#d6ffd6'
    }

    const handleNominationDragLeave: DragEventHandler<HTMLTableRowElement> = (e) => {
        if (selectedDrag !== 'nomination') return

        // @ts-ignore
        e.target.closest('tr').style.background = '#fff'
    }

    const handleNominationDrop: DragEventHandler<HTMLTableRowElement> = (e) => {
        if (selectedDrag !== 'nomination') return

        const dragOrder = e.dataTransfer.getData('text/plain')
        // @ts-ignore
        const dropOrder = e.target.closest('tr').dataset.order
        // @ts-ignore
        e.target.closest('tr').style.background = '#fff'

        if (dragOrder === dropOrder) return

        saveMovingNomination(+dragOrder, +dropOrder)
        setSelectedDrag(null)
    }

    return optimisticParticipants.map((participant, index) => (
        <React.Fragment key={participant.id}>
            {optimisticParticipants[index - 1]?.nomination_shortened !== participant.nomination_shortened && (
                <tr
                    className={classNames({ [s.draggable]: !optimisticParticipants
                            .filter(p => p.nomination_shortened === participant.nomination_shortened)
                            .some(p => p.confirmed) && !isMovingNomination })}
                    draggable={!optimisticParticipants
                        .filter(p => p.nomination_shortened === participant.nomination_shortened)
                        .some(p => p.confirmed) && !isMovingNomination}
                    data-order={participant.order_num}
                    onDragStart={handleNominationDragStart}
                    onDragOver={!optimisticParticipants
                        .filter(p => p.nomination_shortened === participant.nomination_shortened)
                        .some(p => p.confirmed) ? handleNominationDragOver : undefined}
                    onDragLeave={!optimisticParticipants
                        .filter(p => p.nomination_shortened === participant.nomination_shortened)
                        .some(p => p.confirmed) ? handleNominationDragLeave : undefined}
                    onDrop={handleNominationDrop}
                >
                    <td colSpan={4} className="text-center font-bold">
                        {participant.nomination_shortened}
                    </td>
                </tr>
            )}
            <tr
                key={participant.id}
                className={classNames(s.participant, { [s.draggable]: !participant.confirmed && !isMovingParticipant })}
                draggable={!participant.confirmed && !isMovingParticipant}
                data-order={participant.order_num}
                onDragStart={handleParticipantDragStart}
                onDragOver={!participant.confirmed ? handleParticipantDragOver : undefined}
                onDragLeave={!participant.confirmed ? handleParticipantDragLeave : undefined}
                onDrop={handleParticipantDrop}
            >
                <td>{participant.order_num}</td>
                <td className="whitespace-pre-wrap">
                    <div className="flex gap-3">
                        {participant.names}
                        {!participant.confirmed && (
                            <button
                                className={s.nameEditBtn}
                                onClick={() => openParticipantNameEditor(participant)}
                            >
                                {svgIcons.edit}
                            </button>
                        )}
                    </div>
                </td>
                <td>{`${participant.country}, ${participant.city}`}</td>
                <td>
                    {!participant.confirmed && (
                        <Popconfirm
                            title="Вы действительно хотите удалить участника?"
                            okText="Удалить"
                            cancelText="Отмена"
                            onConfirm={() => deleteParticipant(participant.id)}
                        >
                            <button
                                disabled={isDeleting}
                                className={s.delete}
                            >
                                {svgIcons.trash}
                            </button>
                        </Popconfirm>
                    )}
                </td>
            </tr>
        </React.Fragment>
    ))
}

interface Props {
    participants: Participant[]
    competitionId: number
    fetchParticipants: () => Promise<void>
    openParticipantNameEditor: (v: Participant) => void
}