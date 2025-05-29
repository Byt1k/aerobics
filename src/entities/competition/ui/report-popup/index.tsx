import React, { FormEvent, useEffect, useState, useTransition } from 'react'
import Popup from '@/shared/ui/popup'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { downloadCompetitionReport } from '../../actions/download-report'
import { toast } from 'react-toastify'
import { createChangeStateHandler } from '@/shared/lib/change-state-handler'

interface FormState {
    date_string: string
    main_judge: string
    main_secretary: string
    place: string
}

export const CompetitionReportPopup: React.FC<Props> = ({ active, setActive, onClose, competitionId, nominationWithAgeGroup }) => {
    const [formState, setFormState] = useState<FormState>({} as FormState)
    const [isPending, startTransition] = useTransition()

    const changeFormState = createChangeStateHandler(setFormState)

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            const [nomination, ageGroup] = nominationWithAgeGroup ? nominationWithAgeGroup.split(' | ') : []

            try {
                await downloadCompetitionReport({
                    ...formState,
                    competition_id: competitionId,
                    nomination: nomination,
                    age_group: encodeURIComponent(ageGroup),
                })

                const savedData = localStorage.getItem('competitionReportData')
                const data: Record<string, FormState> | null = savedData ? JSON.parse(savedData) : null
                localStorage.setItem('competitionReportData', JSON.stringify(
                    data ? { ...data, [competitionId]: formState } : { [competitionId]: formState }
                ))

                setActive(false)
            } catch (e: any) {
                toast.error(`Не удалось сформировать отчет (status: ${e?.status})`)
            }
        })
    }

    useEffect(() => {
        if (active) {
            const savedData = localStorage.getItem('competitionReportData')
            const data: Record<string, FormState> | null = savedData ? JSON.parse(savedData) : null

            if (data?.[competitionId]) {
                setFormState(data[competitionId])
            } else {
                setFormState({
                    date_string: '',
                    main_judge: '',
                    main_secretary: '',
                    place: '',
                })
            }
        }
    }, [active, competitionId])

    return (
        <Popup
            active={active}
            setActive={setActive}
            onClose={onClose}
            title={`Формирование отчета ${nominationWithAgeGroup ? `по номинации "${nominationWithAgeGroup}"` : 'по соревнованию'}`}
            content={
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <Input
                        label="Дата соревнования"
                        value={formState.date_string}
                        onChange={v => changeFormState('date_string', v)}
                        required
                    />
                    <Input
                        label="Место проведения"
                        value={formState.place}
                        onChange={v => changeFormState('place', v)}
                        required
                    />
                    <Input
                        label="Главный судья"
                        value={formState.main_judge}
                        onChange={v => changeFormState('main_judge', v)}
                        required
                    />
                    <Input
                        label="Секретарь"
                        value={formState.main_secretary}
                        onChange={v => changeFormState('main_secretary', v)}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Button className="w-full" disabled={isPending} type="submit">
                            Скачать
                        </Button>
                        <Button
                            className="w-full"
                            variant="transparent"
                            onClick={() => setActive(false)}
                        >
                            Отмена
                        </Button>
                    </div>
                </form>
            }
        />
    )
}

interface Props {
    active: boolean
    setActive: (v: boolean) => void
    nominationWithAgeGroup?: string
    competitionId: number
    onClose?: () => void
}