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
        e.target.parentElement.style.background = '#d6ffd6'
    }

    const handleDragLeave: DragEventHandler<HTMLTableRowElement> = (e) => {
        // @ts-ignore
        e.target.parentElement.style.background = '#fff'
    }

    const handleDrop: DragEventHandler<HTMLTableRowElement> = (e) => {
        const dragOrder = e.dataTransfer.getData('text/plain')
        // @ts-ignore
        const dropOrder = e.target.parentElement.dataset.order
        // @ts-ignore
        e.target.parentElement.style.background = '#fff'

        if (dragOrder === dropOrder) return

        move(+dragOrder, +dropOrder)
    }

    return optimisticParticipants.map(participant => (
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
            <td className="whitespace-pre-wrap">{participant.names}</td>
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
    ))
}

interface Props {
    participants: Participant[]
    competitionId: number
    fetchParticipants: () => Promise<void>
}