import React, { FormEvent, useEffect, useState } from 'react'
import Popup from '@/shared/ui/popup'
import s from './index.module.scss'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { Competition } from '../../model/types'
import { createCompetitionAction } from '../../actions/create-competition'
import { updateCompetitionAction } from '../../actions/update-competition'
import { toast } from 'react-toastify'
import { createChangeStateHandler } from '@/shared/lib/change-state-handler'
import Select from '@/shared/ui/select'
import InputDateTime from '@/shared/ui/date-picker/input-datetime'

export interface FormState {
    title: string
    stage: string
    date_start: string | null
    queues_amount: number
}

export const CompetitionEditorPopup: React.FC<Props> = ({ active, setActive, selected, setSelected, updateCompetitions }) => {
    const initialState: FormState = {
        title: selected?.title ?? '',
        queues_amount: selected?.queues_amount ?? 1,
        stage: selected?.stage ?? '',
        date_start: selected?.date_start ?? null,
    }

    const [formState, setFormState] = useState(initialState)
    const changeFormState = createChangeStateHandler<FormState>(setFormState)

    useEffect(() => {
        setFormState(initialState)
    }, [selected])

    const [isPending, setIsPending] = useState(false)

    const resetForm = () => {
        setSelected(null)
        setFormState(initialState)
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        try {
            if (selected) {
                await updateCompetitionAction(selected.id, formState)

            } else {
                await createCompetitionAction(formState)
            }

            updateCompetitions()
            setActive(false)
            resetForm()
            toast.success('Сохранено')
        } catch {
            toast.error('Что-то пошло не так')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Popup
            active={active}
            setActive={setActive}
            onClose={resetForm}
            title={`${selected ? 'Редактирование' : 'Создание'} соревнования`}
            content={(
                <form onSubmit={onSubmit} className={s.form}>
                    <Input
                        label="Название"
                        value={formState.title}
                        onChange={v => changeFormState('title', v)}
                    />
                    <Input
                        label="Этап"
                        value={formState.stage}
                        onChange={v => changeFormState('stage', v)}
                    />
                    <InputDateTime
                        label="Дата начала"
                        value={formState.date_start}
                        onChange={v => changeFormState('date_start', v)}
                    />
                    <Select
                        label="Количество судейских бригад"
                        options={[{ value: '1', label: '1' }, { value: '2', label: '2' }]}
                        value={formState.queues_amount.toString()}
                        onChange={v => changeFormState('queues_amount', +v)}
                    />
                    <Button type="submit" disabled={isPending} className={s.btn}>
                        {`${selected ? 'Редактировать' : 'Создать'} соревнование`}
                    </Button>
                </form>
            )}
        />
    )
}



interface Props {
    active: boolean
    setActive: (v: boolean) => void
    selected: Competition | null
    setSelected: (v: null) => void
    updateCompetitions: () => void
}