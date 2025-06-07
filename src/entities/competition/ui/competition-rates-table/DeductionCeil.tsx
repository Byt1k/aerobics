import { RatingRow } from '@/kernel/ws'
import { SelectedChangingDeductions } from '@/entities/competition/ui/deductions-editor-popup'
import React from 'react'

interface DeductionCeilProps {
    deduction: number | null
    openPopupChangeDeductions?: (v: boolean) => void
    row: RatingRow
    setSelectedDeductions: (v: SelectedChangingDeductions) => void
}

export const DeductionCeil: React.FC<DeductionCeilProps> = ({
   deduction,
   row,
   setSelectedDeductions,
   openPopupChangeDeductions,
}) =>  {
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