import { Rate, RatingRow } from '@/kernel/ws'

export const calculateTotalExecutionOrArtistry = (rates: Array<Rate | null>): number | null => {
    if (rates.some(r => r === null)) {
        return null
    }

    const rateValues = rates.map(r => r!.rate)

    const sum = rateValues.reduce((acc, rate) => {
        return acc + rate
    }, 0)

    return (sum - Math.max(...rateValues) - Math.min(...rateValues)) / 2
}

export const calculateTotalDeductions = (row: RatingRow) => {
    const deductions = [row.deduction_element, row.deduction_line, row.deduction_judge]

    if (deductions.some(item => item === null)) {
        return null
    }

    return deductions.reduce((acc, current) => acc! + current!, 0)
}

export const calculateTotalRate = (row: RatingRow) => {
    return ((calculateTotalExecutionOrArtistry(row.rates['исполнение']) ?? 0) +
            (calculateTotalExecutionOrArtistry(row.rates['артистичность']) ?? 0) +
            (row.rates['сложность'][0]?.rate ?? 0) / 2
            - (calculateTotalDeductions(row) ?? 0))
        || null
}