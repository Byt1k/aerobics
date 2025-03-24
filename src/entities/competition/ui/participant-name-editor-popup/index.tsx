import React, { useEffect, useState } from 'react'
import Popup from '@/shared/ui/popup'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { toast } from 'react-toastify'
import { Participant } from '../../model/types'
import { changeParticipantName } from '../../actions/changeParticipantName'

export const ParticipantNameEditorPopup: React.FC<Props> = ({
    active,
    setActive,
    participant,
    updateParticipants,
}) => {
    const [value, setValue] = useState('')

    useEffect(() => {
        if (active) {
            setValue(participant.names)
        }
    }, [active])

    const changeName = async () => {
        if (!value) {
            toast.error('Укажите имя')
            return
        }

        try {
            await changeParticipantName(participant.id, value)
            updateParticipants()
            setActive(false)
        } catch {
            toast.error('Не удалось изменить имя участника')
        }
    }

    return (
        <Popup
            active={active}
            setActive={setActive}
            onClose={() => setValue('')}
            title={'Редактирование участника'}
            content={<Input
                label="Имя"
                value={value}
                onChange={setValue}
            />}
            actions={<div className="grid grid-cols-2 gap-4">
                <Button className="w-full" onClick={changeName}>
                    Изменить
                </Button>
                <Button
                    className="w-full"
                    variant="transparent"
                    onClick={() => setActive(false)}
                >
                    Отмена
                </Button>
            </div>}
        />
    )
}

interface Props {
    active: boolean
    setActive: (v: boolean) => void
    participant: Participant
    updateParticipants: () => void
}