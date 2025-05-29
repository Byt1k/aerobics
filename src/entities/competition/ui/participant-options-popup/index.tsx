import React from 'react'
import Popup from '@/shared/ui/popup'
import Button from '@/shared/ui/button'
import { RatingRow } from '@/kernel/ws'
import { useCurrentUser } from '@/entities/user'

export const ParticipantOptionsPopup: React.FC<Props> = ({
    active,
    setActive,
    onClose,
    participant,
    unconfirmParticipant,
    showParticipant,
}) => {
    const currentUser = useCurrentUser()

    return (
        <Popup
            active={active}
            setActive={setActive}
            onClose={onClose}
            title={''}
            content={
                <div className="flex gap-4">
                    <Button
                        disabled={participant.has_shown}
                        onClick={() => {
                            showParticipant?.(participant.participant.order_num)
                            setActive(false)
                        }}
                    >
                        Показать участника
                    </Button>
                    {!currentUser.is_admin && (
                        <Button
                            variant={'secondary'}
                            onClick={() => {
                                unconfirmParticipant?.(
                                    participant.participant.id,
                                )
                                setActive(false)
                            }}
                        >
                            Переоценить участника
                        </Button>
                    )}
                </div>
            }
        />
    )
}

interface Props {
    active: boolean
    setActive: (v: boolean) => void
    onClose?: () => void
    participant: RatingRow
    unconfirmParticipant?: (participantId: number) => void
    showParticipant?: (participantOrderNum: number) => void
}

export interface SelectedChangingDeductions {
    participantId: number
    line: string
    element: string
    mainJudge: string
}