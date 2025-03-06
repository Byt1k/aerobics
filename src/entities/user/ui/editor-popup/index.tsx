import React, { FormEvent, useEffect, useState } from 'react'
import Popup from '@/shared/ui/popup'
import s from './index.module.scss'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { UserType } from '../../model/types'
import { createUserAction } from '../../actions/create-user'
import { updateUserAction } from '../../actions/update-user'
import { toast } from 'react-toastify'

export interface FormState {
    username: string
    password: string
}

export const UserEditorPopup: React.FC<Props> = ({ active, setActive, selected, setSelected, updateUsersList }) => {
    const [formState, setFormState] = useState<FormState>({
        username: selected?.username ?? '', password: '',
    })
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        setFormState({
            username: selected?.username ?? '',
            password: '',
        })
    }, [selected])

    const resetForm = () => {
        setSelected(null)
        setFormState({
            username: '',
            password: '',
        })
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        try {
            if (selected) {
                await updateUserAction(selected.id, formState)

            } else {
                await createUserAction(formState)
            }

            updateUsersList()
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
            title={`${selected ? 'Редактирование' : 'Создание'} пользователя`}
            content={(
                <form onSubmit={onSubmit} className={s.form}>
                    <Input
                        label="ФИО"
                        value={formState.username}
                        onChange={v => setFormState(prev => ({ ...prev, username: v }))}
                    />
                    <Input
                        label="Пароль"
                        isPassword
                        value={formState.password}
                        onChange={v => setFormState(prev => ({ ...prev, password: v }))}
                    />
                    <Button type="submit" disabled={isPending} className={s.btn}>
                        {`${selected ? 'Редактировать' : 'Создать'} пользователя`}
                    </Button>
                </form>
            )}
        />
    )
}



interface Props {
    active: boolean
    setActive: (v: boolean) => void
    selected: UserType | null
    setSelected: (v: null) => void
    updateUsersList: () => void
}