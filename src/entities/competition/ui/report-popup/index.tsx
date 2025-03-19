import React, { FormEvent, useEffect, useState, useTransition } from 'react'
import Popup from '@/shared/ui/popup'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { downloadCompetitionReport } from '../../actions/download-report'
import { toast } from 'react-toastify'

export const CompetitionReportPopup: React.FC<Props> = ({ active, setActive, onClose, competitionId, nominationWithAgeGroup }) => {
    const [date, setDate] = useState('')
    const [mainJudge, setMainJudge] = useState('')
    const [mainSecretary, setMainSecretary] = useState('')

    const [isPending, startTransition] = useTransition()

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            const [nomination, ageGroup] = nominationWithAgeGroup ? nominationWithAgeGroup.split(' | ') : []

            try {
                await downloadCompetitionReport({
                    competition_id: competitionId,
                    date_string: date,
                    main_judge: mainJudge,
                    main_secretary: mainSecretary,
                    nomination: nomination,
                    age_group: ageGroup,
                })
                setActive(false)
            } catch {
                toast.error('Не удалось сформировать отчет')
            }
        })
    }

    const resetForm = () => {
        setDate('')
        setMainJudge('')
        setMainSecretary('')
    }

    useEffect(() => {
        if (!active) {
            resetForm()
        }
    }, [active])

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
                        value={date}
                        onChange={setDate}
                    />
                    <Input
                        label="Главный судья"
                        value={mainJudge}
                        onChange={setMainJudge}
                    />
                    <Input
                        label="Секретарь"
                        value={mainSecretary}
                        onChange={setMainSecretary}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Button className="w-full" disabled={isPending} type="submit">Скачать</Button>
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