import { Rate } from '@/kernel/ws'
import { SelectedChangingRate } from '@/entities/competition/ui/rate-editor-popup'
import { Popconfirm } from 'antd'
import React from 'react'

interface RateCeilProps {
    rate: Rate | null
    refereeShortName: string
    declinedRate?: (userId: number) => void
    participantId: number
    openPopupChangeRate?: (v: boolean) => void
    setSelectedRate: (v: SelectedChangingRate) => void
    isDifficulty?: boolean
}

export const RateCeil: React.FC<RateCeilProps> = ({
  rate,
  openPopupChangeRate,
  setSelectedRate,
  declinedRate,
  refereeShortName,
  participantId,
  isDifficulty,
}) => {
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