import React from 'react'
import { svgIcons } from '@/shared/lib/svgIcons'
import s from './index.module.scss'
import classNames from 'classnames'
import { RatingRow } from '@/kernel/ws'
import { DeductionCeil } from './DeductionCeil'
import { RateCeil } from './RateCeil'
import {
    calculateTotalDeductions,
    calculateTotalExecutionOrArtistry,
    calculateTotalRate,
} from '@/shared/lib/calculateTotalRate'
import { ChangeDeductionsPayload, ChangeRatePayload } from './index'
import { SelectedChangingRate } from '@/entities/competition/ui/rate-editor-popup'
import { SelectedChangingDeductions } from '@/entities/competition/ui/deductions-editor-popup'

export const TableRow: React.FC<TableRowProps> = React.memo(
({
    row,
    isCurrentParticipant,
    currentUser,
    showParticipant,
    translationQueue,
    declinedRate,
    changeRate,
    changeDeductions,
    setReportNominationWithAgeGroup,
    setIsReport,
    setSelectedParticipant,
    setParticipantOptionsPopup,
    setChangeRatePopup,
    setSelectedChangingRate,
    setChangeDeductionsPopup,
    setSelectedChangingDeductions,
    prevNominationWithAgeGroup,
    participantPlace,
}) => {
    const nominationWithAgeGroup = `${row.participant.nomination} | ${row.participant.age_group}`

    return (
        <React.Fragment key={row.participant_id}>
            {nominationWithAgeGroup !== prevNominationWithAgeGroup && (
                <tr>
                    <td className="text-center font-bold" colSpan={20}>
                        <div className="flex items-center justify-center gap-4">
                            {nominationWithAgeGroup}
                            {currentUser.is_admin && (
                                <button
                                    onClick={() => {
                                        setReportNominationWithAgeGroup(
                                            nominationWithAgeGroup,
                                        )
                                        setIsReport(true)
                                    }}
                                >
                                    {svgIcons.download}
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
            )}
            <tr
                className={classNames(
                    { [s.current]: isCurrentParticipant },
                    { [s.confirmed]: row.confirmed },
                    {
                        [s.waiting]: translationQueue?.some(
                            num => num === row.participant.order_num,
                        ),
                    },
                    { [s.shown]: row.has_shown },
                )}
            >
                <td
                    className={`max-w-[200px] ${showParticipant && !row.has_shown && row.confirmed && 'cursor-pointer'}`}
                    onClick={
                        showParticipant && !row.has_shown && row.confirmed
                            ? () => {
                                  setSelectedParticipant(row)
                                  setParticipantOptionsPopup(true)
                              }
                            : undefined
                    }
                >
                    {row.participant.names}
                </td>

                {row.rates['исполнение'].map((rate, i) => (
                    <MemoizedRateCeil
                        key={`execution-${row.participant_id}-${i}`}
                        rate={rate}
                        refereeShortName={`И${i + 1}`}
                        declinedRate={declinedRate}
                        openPopupChangeRate={
                            changeRate ? setChangeRatePopup : undefined
                        }
                        setSelectedRate={setSelectedChangingRate}
                        participantId={row.participant_id}
                    />
                ))}
                <td className="font-bold">
                    {calculateTotalExecutionOrArtistry(
                        row.rates['исполнение'],
                    )?.toFixed(2)}
                </td>

                {row.rates['артистичность'].map((rate, i) => (
                    <MemoizedRateCeil
                        key={`artistry-${row.participant_id}-${i}`}
                        rate={rate}
                        refereeShortName={`А${i + 1}`}
                        declinedRate={declinedRate}
                        openPopupChangeRate={
                            changeRate ? setChangeRatePopup : undefined
                        }
                        setSelectedRate={setSelectedChangingRate}
                        participantId={row.participant_id}
                    />
                ))}
                <td className="font-bold">
                    {calculateTotalExecutionOrArtistry(
                        row.rates['артистичность'],
                    )?.toFixed(2)}
                </td>

                <MemoizedRateCeil
                    key={`difficulty-${row.participant_id}`}
                    rate={row.rates['сложность'][0]}
                    refereeShortName={'C1'}
                    declinedRate={declinedRate}
                    openPopupChangeRate={
                        changeRate ? setChangeRatePopup : undefined
                    }
                    setSelectedRate={setSelectedChangingRate}
                    participantId={row.participant_id}
                    isDifficulty
                />
                <td>{row.rates['сложность'][0]?.rate}</td>
                <td className="font-bold">
                    {row.rates['сложность'][0]?.rate
                        ? row.rates['сложность'][0]?.rate / 2
                        : null}
                </td>

                <MemoizedDeductionCeil
                    key={`deduction-line-${row.participant_id}`}
                    deduction={row.deduction_line}
                    openPopupChangeDeductions={
                        changeDeductions
                            ? setChangeDeductionsPopup
                            : undefined
                    }
                    setSelectedDeductions={setSelectedChangingDeductions}
                    row={row}
                />
                <MemoizedDeductionCeil
                    key={`deduction-element-${row.participant_id}`}
                    deduction={row.deduction_element}
                    openPopupChangeDeductions={
                        changeDeductions
                            ? setChangeDeductionsPopup
                            : undefined
                    }
                    setSelectedDeductions={setSelectedChangingDeductions}
                    row={row}
                />
                <MemoizedDeductionCeil
                    key={`deduction-judge-${row.participant_id}`}
                    deduction={row.deduction_judge}
                    openPopupChangeDeductions={
                        changeDeductions
                            ? setChangeDeductionsPopup
                            : undefined
                    }
                    setSelectedDeductions={setSelectedChangingDeductions}
                    row={row}
                />

                <td className="font-bold">
                    {calculateTotalDeductions(row)?.toFixed(2)}
                </td>

                <td className="font-bold">
                    {calculateTotalRate(row)?.toFixed(2)}
                </td>
                <td className="font-bold">
                    {participantPlace}
                </td>
            </tr>
        </React.Fragment>
    )
}, arePropsEqual)

// Функция для сравнения пропсов
function arePropsEqual(prevProps: TableRowProps, nextProps: TableRowProps) {
    // Сравниваем только необходимые данные строки
    return (
        prevProps.row.participant_id === nextProps.row.participant_id &&
        JSON.stringify(prevProps.row.rates) ===
            JSON.stringify(nextProps.row.rates) &&
        prevProps.row.deduction_line === nextProps.row.deduction_line &&
        prevProps.row.deduction_element === nextProps.row.deduction_element &&
        prevProps.row.deduction_judge === nextProps.row.deduction_judge &&
        prevProps.row.confirmed === nextProps.row.confirmed &&
        prevProps.row.has_shown === nextProps.row.has_shown &&
        JSON.stringify(prevProps.translationQueue) ===
            JSON.stringify(nextProps.translationQueue) &&
        prevProps.prevNominationWithAgeGroup === nextProps.prevNominationWithAgeGroup &&
        prevProps.participantPlace === nextProps.participantPlace &&
        prevProps.isCurrentParticipant === nextProps.isCurrentParticipant
    )
}

interface TableRowProps {
    row: RatingRow
    isCurrentParticipant: boolean
    currentUser: any
    showParticipant?: (participantOrderNum: number) => void
    translationQueue: number[]
    declinedRate?: (userId: number) => void
    changeRate?: (payload: ChangeRatePayload) => void
    changeDeductions?: (payload: ChangeDeductionsPayload) => void
    setReportNominationWithAgeGroup: (v: string) => void
    setIsReport: (v: boolean) => void
    setSelectedParticipant: (v: RatingRow) => void
    setParticipantOptionsPopup: (v: boolean) => void
    setChangeRatePopup: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedChangingRate: React.Dispatch<SelectedChangingRate | undefined>
    setChangeDeductionsPopup: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedChangingDeductions: React.Dispatch<React.SetStateAction<SelectedChangingDeductions | undefined>>
    prevNominationWithAgeGroup: string
    participantPlace: number | undefined
}

// Мемоизированные компоненты ячеек
const MemoizedRateCeil = React.memo(RateCeil, (prevProps, nextProps) => {
    return (
        prevProps.rate?.rate === nextProps.rate?.rate &&
        prevProps.rate?.user_id === nextProps.rate?.user_id &&
        prevProps.participantId === nextProps.participantId
    )
})

const MemoizedDeductionCeil = React.memo(
    DeductionCeil,
    (prevProps, nextProps) => {
        return (
            prevProps.deduction === nextProps.deduction &&
            prevProps.row.participant_id === nextProps.row.participant_id
        )
    },
)
