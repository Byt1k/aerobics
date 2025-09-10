import { useCallback, useEffect, useState } from 'react'
import { calculateTotalExecutionOrArtistry, calculateTotalRate } from '@/shared/lib/calculateTotalRate'
import { RatingRow } from '@/kernel/ws'

interface LeaderboardItem {
    participantId: number
    totalRate: number
    executionRate: number
    artistryRate: number
    difficultyRate: number
    place: number
}

// группировка участников по краткому названию номинации (т.к там есть номинация и возрастная группа)
type Leaderboard = Record<string, LeaderboardItem[]>

export const useLeaderboard = (rows: RatingRow[]) => {
    const [leaderboard, setLeaderboard] = useState<Leaderboard>({})

    useEffect(() => {
        const list: Leaderboard = {}

        for (const row of rows) {
            const groupKey = row.participant.nomination_shortened

            if (row.confirmed) {
                const item: LeaderboardItem = {
                    participantId: row.participant.id,
                    totalRate: calculateTotalRate(row)!,
                    executionRate: calculateTotalExecutionOrArtistry(row.rates['исполнение']) || 0,
                    artistryRate: calculateTotalExecutionOrArtistry(row.rates['артистичность']) || 0,
                    difficultyRate: row.rates['сложность'][0]?.rate ? row.rates['сложность'][0].rate / 2 : 0,
                    place: 0, // определится дальше
                }

                if (list[groupKey]) {
                    list[groupKey].push(item)
                } else {
                    list[groupKey] = [item]
                }
            }
        }

        // Сортируем участников в каждой номинации по правилам
        Object.keys(list).forEach(shortNomination => {
            const group = list[shortNomination]

            // Сортируем по убыванию
            group.sort((a, b) => {
                // 1. Сравниваем итоговую оценку
                if (a.totalRate !== b.totalRate) {
                    return b.totalRate - a.totalRate
                }

                // 2. Если итоговые равны, сравниваем по исполнению
                if (a.executionRate !== b.executionRate) {
                    return b.executionRate - a.executionRate
                }

                // 3. Если и по исполнению равны, сравниваем по артистичности
                if (a.artistryRate !== b.artistryRate) {
                    return b.artistryRate - a.artistryRate
                }

                // 4. Если все предыдущие равны, сравниваем по сложности
                if (a.difficultyRate !== b.difficultyRate) {
                    return b.difficultyRate - a.difficultyRate
                }

                // 5. Если все оценки равны - участники делят место
                return 0
            })

            // Расставляем места с учетом возможных ничьих
            let currentPlace = 1
            for (let i = 0; i < group.length; i++) {
                if (i > 0 && !compareItemsEqual(group[i], group[i-1])) {
                    currentPlace = i + 1
                }
                group[i].place = currentPlace
            }
        })

        setLeaderboard(list)
    }, [rows])

    const getParticipantPlace = useCallback((shortNomination: string, participantId: number) => {
        return leaderboard[shortNomination]
            ?.find(item => participantId === item.participantId)
            ?.place
    }, [leaderboard])

    return { getParticipantPlace }
}

// Вспомогательная функция для сравнения всех оценок участников
const compareItemsEqual = (a: LeaderboardItem, b: LeaderboardItem) => {
    return a.totalRate === b.totalRate &&
        a.executionRate === b.executionRate &&
        a.artistryRate === b.artistryRate &&
        a.difficultyRate === b.difficultyRate
}