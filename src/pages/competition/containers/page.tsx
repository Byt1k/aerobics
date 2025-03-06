import React, { useLayoutEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCompetition, Competition, competitionStatuses } from '@/entities/competition'
import Tag, { TagProps } from '@/shared/ui/tag'
import { formatDate } from '@/shared/lib/formatDate'
import { Breadcrumb, Tabs, TabsProps } from 'antd'
import { routes } from '@/kernel/routes'
import RefereeingTeams from '../ui/refereeing-teams'
import CompetitionParticipants from '../ui/participants'

export const CompetitionPage = () => {
    const { id } = useParams<{ id: string }>()
    const [competition, setCompetition] = useState<Competition | null>(null)

    useLayoutEffect(() => {
        getCompetition(id!)
            .then(res => setCompetition(res))
            .catch(() => setCompetition(null))
    }, [id])

    const items: TabsProps['items'] = useMemo(() => {
        if (!competition) return []

        return [
            {
                key: '1',
                label: 'Судьи',
                children: <RefereeingTeams competition={competition} />,
            },
            {
                key: '2',
                label: 'Стартовый протокол',
                children: <CompetitionParticipants competition={competition} />,
            },
            {
                key: '3',
                label: 'Оценки',
                children: 'Таблица оценок',
            },
        ]
    }, [competition])

    if (!competition) {
        return (
            <div>
                Соревнование не найдено
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <Breadcrumb
                items={[
                    { title: <Link to={routes.competitionsList()}>Соревнования</Link> },
                    { title: competition.title },
                ]}
                className="-mt-2"
            />
            <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-center">
                    <h2>{competition.title}</h2>
                    <Tag
                        variant={{
                            finished: 'success',
                            not_started: 'danger',
                            unrated: 'danger',
                            ongoing: 'info'
                        }[competition.status] as TagProps['variant']}
                    >
                        {competitionStatuses[competition.status]}
                    </Tag>
                </div>
                <p>Дата начала: {formatDate(competition.date_start)}</p>
            </div>

            <Tabs defaultActiveKey="1"  items={items} />

        </div>
    )
}
