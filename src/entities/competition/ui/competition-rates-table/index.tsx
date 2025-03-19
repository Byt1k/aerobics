import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import s from './index.module.scss'
import { RatingRow, Rate } from '@/kernel/ws'
import { Popconfirm } from 'antd'
import { useCurrentUser } from '@/entities/user'
import { svgIcons } from '@/shared/lib/svgIcons'
import { CompetitionReportPopup } from '../report-popup'

interface LeaderboardItem {
    participantId: number
    totalRates: number
}

export const CompetitionRatesTable: React.FC<Props> = ({
    queue,
    rows,
    declinedRate,
    competitionId,
}) => {
    const currentUser = useCurrentUser()
    const [isReport, setIsReport] = useState(false)
    const [reportNominationWithAgeGroup, setReportNominationWithAgeGroup] = useState<string>()
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])

    const totalExecutionOrArtistry = (rates: Array<Rate | null>): number | null => {
        if (rates.some(r => r === null)) {
            return null
        }

        const rateValues = rates.map(r => r!.rate)

        const sum = rateValues.reduce((acc, rate) => {
            return acc + rate
        }, 0)

        return (sum - Math.max(...rateValues) - Math.min(...rateValues)) / 2
    }

    const totalDeductions = (row: RatingRow) => {
        const deductions = [row.deduction_element, row.deduction_line, row.deduction_judge]

        if (deductions.some(item => item === null)) {
            return null
        }

        return deductions.reduce((acc, current) => acc! + current!, 0)
    }

    const calculateTotalRate = (row: RatingRow) => {
        return ((totalExecutionOrArtistry(row.rates['исполнение']) ?? 0) +
            (totalExecutionOrArtistry(row.rates['артистичность']) ?? 0) +
            (row.rates['сложность'][0]?.rate ?? 0) / 2
            - (totalDeductions(row) ?? 0))
        || null
    }

    useEffect(() => {
        const confirmedRows: LeaderboardItem[] = rows
            .filter(row => row.confirmed)
            .map(row => ({
                participantId: row.participant_id,
                totalRates: calculateTotalRate(row)!
            }))

        confirmedRows.sort((a, b) => b.totalRates - a.totalRates)

        setLeaderboard(confirmedRows)
    }, [rows])

    return (
        <>
            <table className={s.table}>
                <thead>
                <tr>
                    <td className="text-center font-bold" colSpan={20}>Бригада {queue}</td>
                </tr>
                <tr>
                    <td rowSpan={2}>Выступающие</td>
                    <td colSpan={5}>Исполнение</td>
                    <td colSpan={5}>Артистичность</td>
                    <td colSpan={3}>Сложность</td>
                    <td colSpan={4}>Сбавки арбитра</td>
                    <td rowSpan={2}>Общий балл</td>
                    <td rowSpan={2}>Место</td>
                </tr>
                <tr>
                    <td className="text-center">И1</td>
                    <td>И2</td>
                    <td>И3</td>
                    <td>И4</td>
                    <td>
                        <p>И</p>
                        <p>Итог</p>
                    </td>
                    <td>А1</td>
                    <td>А2</td>
                    <td>А3</td>
                    <td>А4</td>
                    <td>
                        <p>А</p>
                        <p>Итог</p>
                    </td>
                    <td>C1</td>
                    <td>C2</td>
                    <td>
                        <p>C</p>
                        <p>Итог</p>
                    </td>
                    <td>Э</td>
                    <td>Л</td>
                    <td>ГС</td>
                    <td>
                        <p>СБ</p>
                        <p>Итог</p>
                    </td>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, rowIndex) => {
                    const nominationWithAgeGroup = `${row.participant.nomination} | ${row.participant.age_group}`
                    const prevNominationWithAgeGroup = `${rows[rowIndex - 1]?.participant.nomination} | ${rows[rowIndex - 1]?.participant.age_group}`

                    return (
                        <React.Fragment key={row.participant_id}>
                            {nominationWithAgeGroup !== prevNominationWithAgeGroup && (
                                <tr>
                                    <td className="text-center font-bold" colSpan={20}>
                                        <div className="flex items-center justify-center gap-4">
                                            {nominationWithAgeGroup}
                                            {currentUser.is_admin && (
                                                <button onClick={() => {
                                                    setReportNominationWithAgeGroup(nominationWithAgeGroup)
                                                    setIsReport(true)
                                                }}>
                                                    {svgIcons.download}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                            <tr
                                key={row.participant_id}
                                className={classNames(
                                    { [s.current]: !rowIndex && !row.confirmed },
                                    { [s.current]: rows[rowIndex - 1]?.confirmed && !row.confirmed },
                                    { [s.confirmed]: row.confirmed },
                                )}>
                                <td>
                                    {row.participant.names}
                                </td>

                                {row.rates['исполнение'].map((rate, i) => (
                                    <td key={i}>
                                        {declinedRate && rate ? (
                                            <Popconfirm
                                                title={`Вы хотите отменить оценку И${i + 1}`}
                                                cancelText="Нет"
                                                okText="Да"
                                                onConfirm={() => declinedRate(rate.user_id)}
                                            >
                                                <button>{rate?.rate}</button>
                                            </Popconfirm>
                                        ) : rate?.rate}
                                    </td>
                                ))}
                                <td>{totalExecutionOrArtistry(row.rates['исполнение'])}</td>

                                {row.rates['артистичность'].map((rate, i) => (
                                    <td key={i}>
                                        {declinedRate && rate ? (
                                            <Popconfirm
                                                title={`Вы хотите отменить оценку А${i + 1}`}
                                                cancelText="Нет"
                                                okText="Да"
                                                onConfirm={() => declinedRate(rate.user_id)}
                                            >
                                                <button>{rate?.rate}</button>
                                            </Popconfirm>
                                        ) : rate?.rate}
                                    </td>
                                ))}
                                <td>{totalExecutionOrArtistry(row.rates['артистичность'])}</td>

                                <td>
                                    {declinedRate && row.rates['сложность'][0]?.rate ? (
                                        <Popconfirm
                                            title={`Вы хотите отменить оценку С1`}
                                            cancelText="Нет"
                                            okText="Да"
                                            onConfirm={() => declinedRate(row.rates['сложность'][0]!.user_id)}
                                        >
                                            <button>{row.rates['сложность'][0]?.rate}</button>
                                        </Popconfirm>
                                    ) : row.rates['сложность'][0]?.rate}
                                </td>
                                <td>{row.rates['сложность'][0]?.rate}</td>
                                <td>
                                    {row.rates['сложность'][0]?.rate
                                        ? row.rates['сложность'][0]?.rate / 2
                                        : null
                                    }
                                </td>

                                <td>{row.deduction_element}</td>
                                <td>{row.deduction_line}</td>
                                <td>{row.deduction_judge}</td>
                                <td>
                                    {totalDeductions(row)}
                                </td>

                                <td>
                                    {calculateTotalRate(row)}
                                </td>
                                <td>
                                    {row.confirmed && leaderboard
                                        .findIndex(p => p.participantId === row.participant_id)! + 1}
                                </td>
                            </tr>
                        </React.Fragment>
                    )
                })}
                </tbody>
            </table>
            <CompetitionReportPopup
                active={isReport}
                setActive={setIsReport}
                competitionId={competitionId}
                nominationWithAgeGroup={reportNominationWithAgeGroup}
                onClose={() => setReportNominationWithAgeGroup(undefined)}
            />
        </>
    )
}

interface Props {
    queue: number
    rows: RatingRow[]
    declinedRate?: (userId: number) => void
    competitionId: number
}
