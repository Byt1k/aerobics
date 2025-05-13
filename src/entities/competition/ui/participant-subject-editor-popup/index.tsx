import React, { useEffect, useState } from 'react'
import Popup from '@/shared/ui/popup'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { toast } from 'react-toastify'
import { Participant } from '../../model/types'
import { changeParticipantSubject } from '../../actions/change-participant-subject'

export const ParticipantSubjectEditorPopup: React.FC<Props> = ({
    active,
    setActive,
    participant,
    updateParticipants,
}) => {
    const [country, setCountry] = useState('')
    const [city, setCity] = useState('')

    useEffect(() => {
        if (active) {
            setCountry(participant.country)
            setCity(participant.city)
        }
    }, [active])

    const changeSubject = async () => {
        // if (!value) {
        //     toast.error('Укажите имя')
        //     return
        // }

        try {
            await changeParticipantSubject(participant.id, { country, city })
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
            onClose={() => {
                setCountry('')
                setCity('')
            }}
            title={'Редактирование участника'}
            content={
                <div className="flex flex-col gap-2">
                    <Input
                        label="Страна"
                        value={country}
                        onChange={setCountry}
                    />
                    <Input
                        label="Город"
                        value={city}
                        onChange={setCity}
                    />
                </div>
            }
            actions={<div className="grid grid-cols-2 gap-4">
                <Button className="w-full" onClick={changeSubject}>
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