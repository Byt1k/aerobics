import { Tabs, TabsProps } from 'antd'
import React, { useMemo } from 'react'
import RefereeingTeams from '../ui/refereeing-teams'
import CompetitionParticipants from '../ui/participants'
import CompetitionRatings from '../ui/ratings'
import { Competition } from '../../../entities/competition'

export const AdminContent: React.FC<Props> = ({ competition }) => {
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
                children: <CompetitionRatings competition={competition} />,
            },
        ]
    }, [competition])

    return (
        <Tabs defaultActiveKey="1"  items={items} />
    )
}

interface Props {
    competition: Competition
}