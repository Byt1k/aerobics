/* eslint-disable @typescript-eslint/ban-ts-comment */

import classNames from 'classnames'
import s from './index.module.scss'
import { Popconfirm } from 'antd'
import React, { DragEventHandler, useOptimistic, useTransition } from 'react'
import { Participant, deleteCompetitionParticipant, moveParticipant } from '@/entities/competition'
import { toast } from 'react-toastify'
import { svgIcons } from '@/shared/lib/svgIcons'

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

    const [isMoving, startMoving] = useTransition()

    const move = (currentOrder: number, newOrder: number) => {
        startMoving(async () => {
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

    const handleDragStart: DragEventHandler<HTMLTableRowElement> = (e) => {
        // @ts-ignore
        e.dataTransfer.setData('text/plain', e.target.dataset.order);
    }

    const handleDragOver: DragEventHandler<HTMLTableRowElement> = (e) => {
        e.preventDefault()
        // @ts-ignore
        e.target.closest('tr').style.background = '#d6ffd6'
    }

    const handleDragLeave: DragEventHandler<HTMLTableRowElement> = (e) => {
        // @ts-ignore
        e.target.closest('tr').style.background = '#fff'
    }

    const handleDrop: DragEventHandler<HTMLTableRowElement> = (e) => {
        const dragOrder = e.dataTransfer.getData('text/plain')
        // @ts-ignore
        const dropOrder = e.target.closest('tr').dataset.order
        // @ts-ignore
        e.target.closest('tr').style.background = '#fff'

        if (dragOrder === dropOrder) return

        move(+dragOrder, +dropOrder)
    }

    return optimisticParticipants.map((participant, index) => (
        <React.Fragment key={participant.id}>
            {optimisticParticipants[index - 1]?.nomination_shortened !== participant.nomination_shortened && (
                <tr>
                    <td colSpan={4} className="text-center font-bold">
                        {participant.nomination_shortened}
                    </td>
                </tr>
            )}
            <tr
                key={participant.id}
                className={classNames(s.participant, { [s.draggable]: !participant.confirmed })}
                draggable={!participant.confirmed && !isMoving}
                data-order={participant.order_num}
                onDragStart={handleDragStart}
                onDragOver={!participant.confirmed ? handleDragOver : undefined}
                onDragLeave={!participant.confirmed ? handleDragLeave : undefined}
                onDrop={handleDrop}
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