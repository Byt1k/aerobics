import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCompetition, Competition, competitionStatuses } from '@/entities/competition'
import Tag, { TagProps } from '@/shared/ui/tag'
import { formatDate } from '@/shared/lib/formatDate'
import { Breadcrumb } from 'antd'
import { routes } from '@/kernel/routes'
import { AdminContent } from './admin-content'
import { RateInputField } from '../ui/rate-input-field'
import { useCurrentUser, userRolesList } from '@/entities/user'
import { getUserRoleAndQueue, UserRoleAndQueueByCompetition } from '@/entities/competition'
import { ArbitratorModule } from '../ui/arbitrator-module'
import Ratings from '../ui/ratings'

export const CompetitionPage = () => {
    const { id } = useParams()
    const currentUser = useCurrentUser()
    const [competition, setCompetition] = useState<Competition | null>(null)
    const [isPending, setIsPending] = useState(true)

    const [refereeRoleAndQueue, setRefereeRoleAndQueue] = useState<UserRoleAndQueueByCompetition | null>(null)

    useEffect(() => {
        if (!id) return

        setIsPending(true)
        getCompetition(id)
            .then(res => setCompetition(res))
            .catch(() => setCompetition(null))
            .finally(() => setIsPending(false))

        if (currentUser.is_admin) return

        getUserRoleAndQueue(id)
            .then(res => setRefereeRoleAndQueue(res))
            .catch(() => setRefereeRoleAndQueue(null))
    }, [id])

    if (!competition && isPending) {
        return <div>Загрузка...</div>
    }

    if (!competition) {
        return <div>Соревнование не найдено</div>
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

            {currentUser.is_admin && <AdminContent competition={competition} />}

            {[
                userRolesList['исполнение судья'],
                userRolesList['элемент судья'],
                userRolesList['сложность судья'],
                // eslint-disable-next-line
                // @ts-ignore
            ].includes(refereeRoleAndQueue?.role.id) && (
                <RateInputField
                    competition={competition}
                    refereeRoleAndQueue={refereeRoleAndQueue!}
                />
            )}

            {refereeRoleAndQueue?.role.id === userRolesList['арбитр'] && (
                <ArbitratorModule
                    competition={competition}
                    refereeRoleAndQueue={refereeRoleAndQueue!}
                />
            )}

            {refereeRoleAndQueue?.role.id === userRolesList['главный судья'] && (
                <Ratings competition={competition} />
            )}
        </div>
    )
}
