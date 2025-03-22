import React, { useEffect, useState } from 'react'
import Popup from '@/shared/ui/popup'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { ChangeDeductionsPayload} from '../competition-rates-table'
import { toast } from 'react-toastify'
import { createChangeStateHandler } from '@/shared/lib/change-state-handler'

export const DeductionsEditorPopup: React.FC<Props> = ({
    active,
    setActive,
    selectedDeductions: {
        participantId,
        line,
        element,
        mainJudge,
    },
    onClose,
    changeDeductions,
}) => {
    const initialState = { line, element, mainJudge }
    const [state, setState] = useState(initialState)
    const changeState = createChangeStateHandler(setState)

    useEffect(() => {
        if (active) {
            setState(initialState)
        }
    }, [active])

    const saveNewDeductions = () => {
        if (Object.values(state).includes('')) {
            toast.error('Заполните все поля')
            return
        }

        if (Object.values(state).some(value => value.length > 3 || +value < 0)) {
            toast.error('Некорректные данные')
            return
        }

        changeDeductions({
            participant_id: participantId,
            deduction_line: +state.line,
            deduction_element: +state.element,
            deduction_judge: +state.mainJudge,
        })

        setActive(false)
    }

    return (
        <Popup
            active={active}
            setActive={setActive}
            onClose={onClose}
            title={'Редактирование cбавок'}
            content={(
                <form>
                    <Input
                        label={'Сбавка за линию'}
                        type="number"
                        value={state.line}
                        onChange={v => changeState('line', v)}
                    />
                    <Input
                        label={'Сбавка за элемент'}
                        type="number"
                        value={state.element}
                        onChange={v => changeState('element', v)}
                    />
                    <Input
                        label={'Сбавка главного судьи'}
                        type="number"
                        value={state.mainJudge}
                        onChange={v => changeState('mainJudge', v)}
                    />
                </form>
            )}
            actions={<div className="grid grid-cols-2 gap-4">
                <Button
                    className="w-full"
                    onClick={saveNewDeductions}
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
    selectedDeductions: SelectedChangingDeductions
    onClose?: () => void
    changeDeductions: (payload: ChangeDeductionsPayload) => void
}

export interface SelectedChangingDeductions {
    participantId: number
    line: string
    element: string
    mainJudge: string
}