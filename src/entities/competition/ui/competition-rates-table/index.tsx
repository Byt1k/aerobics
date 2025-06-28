import React, { useState } from 'react'
import s from './index.module.scss'
import { RatingRow } from '@/kernel/ws'
import { useCurrentUser } from '@/entities/user'
import { CompetitionReportPopup } from '../report-popup'
import { ParticipantRateEditorPopup, SelectedChangingRate } from '../rate-editor-popup'
import { DeductionsEditorPopup, SelectedChangingDeductions } from '../deductions-editor-popup'
import { useLeaderboard } from '@/shared/lib/use-leaderboard'
import { ParticipantOptionsPopup } from '@/entities/competition/ui/participant-options-popup'
import { TableRow } from './TableRow'

export const CompetitionRatesTable: React.FC<Props> = ({
    queue,
    rows,
    declinedRate,
    changeRate,
    changeDeductions,
    competitionId,
    unconfirmParticipant,
    showParticipant,
    translationQueue,
}) => {
    const currentUser = useCurrentUser()
    const [isReport, setIsReport] = useState(false)
    const [reportNominationWithAgeGroup, setReportNominationWithAgeGroup] = useState<string>()

    const [changeRatePopup, setChangeRatePopup] = useState(false)
    const [selectedChangingRate, setSelectedChangingRate] = useState<SelectedChangingRate>()

    const [changeDeductionsPopup, setChangeDeductionsPopup] = useState(false)
    const [selectedChangingDeductions, setSelectedChangingDeductions] = useState<SelectedChangingDeductions>()

    const [participantOptionsPopup, setParticipantOptionsPopup] = useState(false)
    const [selectedParticipant, setSelectedParticipant] = useState<RatingRow>()

    const { getParticipantPlace } = useLeaderboard(rows)

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
                        {/*<p>И</p>*/}
                        <p>Итог</p>
                    </td>
                    <td>А1</td>
                    <td>А2</td>
                    <td>А3</td>
                    <td>А4</td>
                    <td className="font-bold">
                        {/*<p>А</p>*/}
                        <p>Итог</p>
                    </td>
                    <td>C1</td>
                    <td>C2</td>
                    <td className="font-bold">
                        {/*<p>C</p>*/}
                        <p>Итог</p>
                    </td>
                    <td>Л</td>
                    <td>Э</td>
                    <td>ГС</td>
                    <td className="font-bold">
                        {/*<p>СБ</p>*/}
                        <p>Итог</p>
                    </td>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, rowIndex) => (
                    <TableRow
                        key={row.participant_id}
                        row={row}
                        isCurrentParticipant={(rowIndex === 0 || rows[rowIndex - 1]?.confirmed) && !row.confirmed}
                        currentUser={currentUser}
                        showParticipant={showParticipant}
                        translationQueue={translationQueue}
                        declinedRate={declinedRate}
                        changeRate={changeRate}
                        changeDeductions={changeDeductions}
                        setReportNominationWithAgeGroup={setReportNominationWithAgeGroup}
                        setIsReport={setIsReport}
                        setSelectedParticipant={setSelectedParticipant}
                        setParticipantOptionsPopup={setParticipantOptionsPopup}
                        setChangeRatePopup={setChangeRatePopup}
                        setSelectedChangingRate={setSelectedChangingRate}
                        setChangeDeductionsPopup={setChangeDeductionsPopup}
                        setSelectedChangingDeductions={setSelectedChangingDeductions}
                        prevNominationWithAgeGroup={`${rows[rowIndex - 1]?.participant.nomination} | ${rows[rowIndex - 1]?.participant.age_group}`}
                        participantPlace={getParticipantPlace(row.participant.nomination_shortened, row.participant.id)}
                    />
                ))}
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

            {selectedParticipant && (
                <ParticipantOptionsPopup
                    active={participantOptionsPopup}
                    setActive={setParticipantOptionsPopup}
                    onClose={() => setSelectedParticipant(undefined)}
                    participant={selectedParticipant}
                    showParticipant={showParticipant}
                    unconfirmParticipant={unconfirmParticipant}
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
    unconfirmParticipant?: (participantId: number) => void
    competitionId: number
    translationQueue: number[]
    showParticipant?: (participantOrderNum: number) => void
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
