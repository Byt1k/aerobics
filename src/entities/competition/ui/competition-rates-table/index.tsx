import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import s from './index.module.scss'
import { RatingRow, Rate } from '@/kernel/ws'
import { Popconfirm } from 'antd'
import { useCurrentUser } from '@/entities/user'
import { svgIcons } from '@/shared/lib/svgIcons'
import { CompetitionReportPopup } from '../report-popup'
import { ParticipantRateEditorPopup, SelectedChangingRate } from '../rate-editor-popup'
import { DeductionsEditorPopup, SelectedChangingDeductions } from '../deductions-editor-popup'
import { roundToDecimal } from '@/shared/lib/roundToDecimal'

interface LeaderboardItem {
    participantId: number
    totalRates: number
}

export const CompetitionRatesTable: React.FC<Props> = ({
    queue,
    rows,
    declinedRate,
    changeRate,
    changeDeductions,
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

        const res =  (sum - Math.max(...rateValues) - Math.min(...rateValues)) / 2
        return roundToDecimal(res)
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

    const [changeRatePopup, setChangeRatePopup] = useState(false)
    const [selectedChangingRate, setSelectedChangingRate] = useState<SelectedChangingRate>()

    const [changeDeductionsPopup, setChangeDeductionsPopup] = useState(false)
    const [selectedChangingDeductions, setSelectedChangingDeductions] = useState<SelectedChangingDeductions>()

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
                    <td rowSpan={2} className="font-bold">Общий балл</td>
                    <td rowSpan={2} className="font-bold">Место</td>
                </tr>
                <tr>
                    <td className="text-center">И1</td>
                    <td>И2</td>
                    <td>И3</td>
                    <td>И4</td>
                    <td className="font-bold">
                        <p>И</p>
                        <p>Итог</p>
                    </td>
                    <td>А1</td>
                    <td>А2</td>
                    <td>А3</td>
                    <td>А4</td>
                    <td className="font-bold">
                        <p>А</p>
                        <p>Итог</p>
                    </td>
                    <td>C1</td>
                    <td>C2</td>
                    <td className="font-bold">
                        <p>C</p>
                        <p>Итог</p>
                    </td>
                    <td>Л</td>
                    <td>Э</td>
                    <td>ГС</td>
                    <td className="font-bold">
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
                                    <RateCeil
                                        key={i}
                                        rate={rate}
                                        refereeShortName={`И${i + 1}`}
                                        declinedRate={declinedRate}
                                        openPopupChangeRate={changeRate ? setChangeRatePopup : undefined}
                                        setSelectedRate={setSelectedChangingRate}
                                        participantId={row.participant_id}
                                    />
                                ))}
                                <td className="font-bold">
                                    {totalExecutionOrArtistry(row.rates['исполнение'])}
                                </td>

                                {row.rates['артистичность'].map((rate, i) => (
                                    <RateCeil
                                        key={i}
                                        rate={rate}
                                        refereeShortName={`А${i + 1}`}
                                        declinedRate={declinedRate}
                                        openPopupChangeRate={changeRate ? setChangeRatePopup : undefined}
                                        setSelectedRate={setSelectedChangingRate}
                                        participantId={row.participant_id}
                                    />
                                ))}
                                <td className="font-bold">
                                    {totalExecutionOrArtistry(row.rates['артистичность'])}
                                </td>

                                <RateCeil
                                    rate={row.rates['сложность'][0]}
                                    refereeShortName={'C1'}
                                    declinedRate={declinedRate}
                                    openPopupChangeRate={changeRate ? setChangeRatePopup : undefined}
                                    setSelectedRate={setSelectedChangingRate}
                                    participantId={row.participant_id}
                                    isDifficulty
                                />
                                <td>{row.rates['сложность'][0]?.rate}</td>
                                <td className="font-bold">
                                    {row.rates['сложность'][0]?.rate
                                        ? row.rates['сложность'][0]?.rate / 2
                                        : null
                                    }
                                </td>

                                <DeductionCeil
                                    deduction={row.deduction_line}
                                    openPopupChangeDeductions={changeDeductions ? setChangeDeductionsPopup : undefined}
                                    setSelectedDeductions={setSelectedChangingDeductions}
                                    row={row}
                                />
                                <DeductionCeil
                                    deduction={row.deduction_element}
                                    openPopupChangeDeductions={changeDeductions ? setChangeDeductionsPopup : undefined}
                                    setSelectedDeductions={setSelectedChangingDeductions}
                                    row={row}
                                />
                                <DeductionCeil
                                    deduction={row.deduction_judge}
                                    openPopupChangeDeductions={changeDeductions ? setChangeDeductionsPopup : undefined}
                                    setSelectedDeductions={setSelectedChangingDeductions}
                                    row={row}
                                />

                                <td className="font-bold">
                                    {totalDeductions(row)}
                                </td>

                                <td className="font-bold">
                                    {calculateTotalRate(row)}
                                </td>
                                <td className="font-bold">
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

            {selectedChangingRate && changeRate && (
                <ParticipantRateEditorPopup
                    active={changeRatePopup}
                    setActive={setChangeRatePopup}
                    selectedRate={selectedChangingRate}
                    onClose={() => setSelectedChangingRate(undefined)}
                    changeRate={changeRate}
                />
            )}

            {selectedChangingDeductions && changeDeductions && (
                <DeductionsEditorPopup
                    active={changeDeductionsPopup}
                    setActive={setChangeDeductionsPopup}
                    selectedDeductions={selectedChangingDeductions}
                    changeDeductions={changeDeductions}
                    onClose={() => setSelectedChangingDeductions(undefined)}
                />
            )}
        </>
    )
}

interface Props {
    queue: number
    rows: RatingRow[]
    declinedRate?: (userId: number) => void
    changeRate?: (payload: ChangeRatePayload) => void
    changeDeductions?: (payload: ChangeDeductionsPayload) => void
    competitionId: number
}

export interface ChangeRatePayload {
    participant_id: number
    judge_id: number
    rate: number
}

export interface ChangeDeductionsPayload {
    participant_id: number
    deduction_line: number,
    deduction_element: number
    deduction_judge: number
}

interface RateCeilProps {
    rate: Rate | null
    refereeShortName: string
    declinedRate?: (userId: number) => void
    participantId: number
    openPopupChangeRate?: (v: boolean) => void
    setSelectedRate: (v: SelectedChangingRate) => void
    isDifficulty?: boolean
}

function RateCeil({
    rate,
    openPopupChangeRate,
    setSelectedRate,
    declinedRate,
    refereeShortName,
    participantId,
    isDifficulty,
}: RateCeilProps) {
    const select = () => {
        setSelectedRate({
            refereeShortName: refereeShortName,
            rate: rate!,
            participantId: participantId,
            isDifficulty,
        })
        openPopupChangeRate?.(true)
    }

    return (
        <td>
            {declinedRate && rate && (
                <Popconfirm
                    title={`Вы хотите отменить оценку ${refereeShortName}`}
                    cancelText="Нет"
                    okText="Да"
                    onConfirm={() => declinedRate(rate.user_id)}
                >
                    <button>{rate.rate}</button>
                </Popconfirm>
            )}

            {openPopupChangeRate && rate && (
                <button onClick={select}>{rate.rate}</button>
            )}

            {!declinedRate && !openPopupChangeRate && rate && rate.rate}
        </td>
    )
}

interface DeductionCeilProps {
    deduction: number | null
    openPopupChangeDeductions?: (v: boolean) => void
    row: RatingRow
    setSelectedDeductions: (v: SelectedChangingDeductions) => void
}

function DeductionCeil({
    deduction,
    row,
    setSelectedDeductions,
    openPopupChangeDeductions,
}: DeductionCeilProps) {
    const select = () => {
        setSelectedDeductions({
            participantId: row.participant_id,
            line: row.deduction_line!.toString(),
            element: row.deduction_element!.toString(),
            mainJudge: row.deduction_judge!.toString(),
        })
        openPopupChangeDeductions?.(true)
    }

    return (
        <td>
            {openPopupChangeDeductions && deduction !== null && (
                <button onClick={select}>{deduction}</button>
            )}

            {!openPopupChangeDeductions && deduction}
        </td>
    )
}
