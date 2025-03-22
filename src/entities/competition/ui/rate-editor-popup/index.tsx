import React, { useEffect, useState } from 'react'
import Popup from '@/shared/ui/popup'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { Rate } from '@/kernel/ws'
import { ChangeRatePayload } from '../competition-rates-table'
import { toast } from 'react-toastify'

export const ParticipantRateEditorPopup: React.FC<Props> = ({
    active,
    setActive,
    selectedRate: {
        refereeShortName,
        rate,
        participantId,
        isDifficulty
    },
    onClose,
    changeRate,
}) => {
    const [value, setValue] = useState('')

    useEffect(() => {
        if (active) {
            setValue(rate?.rate.toString() ?? '')
        }
    }, [active])

    const saveNewRate = () => {
        if (value.length > 3) {
            toast.error('Некорректная оценка')
            return
        }

        if (isDifficulty && +value < 0) {
            toast.error('Некорректная оценка')
            return
        } else if (+value < 0 || +value > 10) {
            toast.error('Некорректная оценка')
            return
        }

        changeRate({
            participant_id: participantId,
            judge_id: rate!.user_id,
            rate: +value,
        })

        setActive(false)
    }

    return (
        <Popup
            active={active}
            setActive={setActive}
            onClose={onClose}
            title={'Редактирование оценки ' + refereeShortName}
            content={<Input
                label="Оценка"
                value={value}
                onChange={setValue}
            />}
            actions={<div className="grid grid-cols-2 gap-4">
                <Button
                    className="w-full"
                    onClick={saveNewRate}
                >
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
    selectedRate: SelectedChangingRate
    onClose?: () => void
    changeRate: (payload: ChangeRatePayload) => void
}

export interface SelectedChangingRate {
    participantId: number
    refereeShortName: string
    rate: Rate
    isDifficulty?: boolean
}