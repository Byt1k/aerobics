import React, { useEffect, useMemo, useState } from 'react'
import Button from '@/shared/ui/button'
import Table, { TableColumns } from '@/shared/ui/table'
import s from './index.module.scss'
import { CompetitionEditorPopup, getCompetitionsList, deleteCompetitionAction, competitionStatuses, Competition } from '@/entities/competition'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import Tag, { TagProps } from '@/shared/ui/tag'
import { formatDate } from '@/shared/lib/formatDate'

export const CompetitionsListPage = () => {
    const [competitionsList, setCompetitionsList] = useState<Competition[]>([])

    const getCompetitions = () => {
        getCompetitionsList().then(res => setCompetitionsList(res))
    }

    useEffect(() => {
        getCompetitions()
    }, [])

    const [editorOpened, setEditorOpened] = useState(false)
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)

    const editCompetition = (competition: Competition) => {
        setSelectedCompetition(competition)
        setEditorOpened(true)
    }

    const [isDeleting, setIsDeleting] = useState<number[]>([])

    const deleteCompetition = async (competitionId: number) => {
        setIsDeleting(prev => [...prev, competitionId])

        try {
            await deleteCompetitionAction(competitionId)
            getCompetitions()
            toast.success('Соревнование удалено')
        } catch {
            toast.error('Не удалось удалить соревнование')
        } finally {
            setIsDeleting(prev => prev.filter(id => id !== competitionId))
        }
    }

    const columns: TableColumns<Competition> = useMemo(() => [
        {
            name: 'Название',
            key: 'title',
            dataIndex: 'title',
        },
        {
            name: 'Этап',
            key: 'stage',
            dataIndex: 'stage',
        },
        {
            name: 'Количество бригад',
            key: 'queues_amount',
            dataIndex: 'queues_amount',
        },
        {
            name: 'Дата начала',
            key: 'date_start',
            render: comp => formatDate(comp.date_start)
        },
        {
            name: 'Статус',
            key: 'status',
            render: ({ status }) => (
                <Tag
                    variant={{
                        finished: 'success',
                        not_started: 'danger',
                        unrated: 'danger',
                        ongoing: 'info'
                    }[status] as TagProps['variant']}
                >
                    {competitionStatuses[status]}
                </Tag>
            )
        },
        {
            key: 'actions',
            render: comp => (
                <div className="flex justify-end gap-2">
                    <Link to={`/competitions/${comp.id}`}>
                        <Button className={s.tableBtn} asChild>
                            Открыть
                        </Button>
                    </Link>
                    <Button
                        variant="outlined"
                        className={s.tableBtn}
                        onClick={() => editCompetition(comp)}
                    >
                        Редактировать
                    </Button>
                    <Button
                        variant="secondary"
                        className={s.tableBtn}
                        onClick={() => deleteCompetition(comp.id)}
                        disabled={isDeleting.some(id => id === comp.id)}
                    >
                        Удалить
                    </Button>
                </div>
            )
        }
    ], [isDeleting])

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1>Соревнования</h1>
                <Button onClick={() => setEditorOpened(true)}>
                    Создать соревнование
                </Button>
            </div>

            <Table<Competition> columns={columns} data={competitionsList} />

            <CompetitionEditorPopup
                active={editorOpened}
                setActive={setEditorOpened}
                selected={selectedCompetition}
                setSelected={setSelectedCompetition}
                updateCompetitions={getCompetitions}
            />
        </div>
    )
}
