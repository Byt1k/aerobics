import React, { useState, useTransition } from 'react'
import Button from '@/shared/ui/button'
import { toast } from 'react-toastify'
import { downloadParticipants } from '../../actions/download-participants'
import Popup from '@/shared/ui/popup'
import Input from '@/shared/ui/input'

export const DownloadParticipants: React.FC<Props> = ({ competitionId }) => {
    const [active, setActive] = useState(false)
    const [protocolTitle, setProtocolTitle] = useState('')

    const [isDownloading, startDownloading] = useTransition()

    const download = () => {
        startDownloading(async () => {
            try {
                await downloadParticipants(competitionId, protocolTitle)
                setActive(false)
            } catch {
                toast.error('Скачивание не удалось')
            }
        })
    }

    return (
        <>
            <Button
                variant="secondary"
                disabled={isDownloading}
                onClick={() => setActive(true)}
            >
                Скачать
            </Button>
            <Popup
                active={active}
                setActive={setActive}
                onClose={() => setProtocolTitle('')}
                title="Скачать протокол"
                content={<Input
                    label="Название протокола (необязательно)"
                    value={protocolTitle}
                    onChange={setProtocolTitle}
                />}
                actions={<div className="grid grid-cols-2 gap-4">
                    <Button className="w-full" onClick={download}>
                        Скачать
                    </Button>
                    <Button
                        className="w-full"
                        variant="transparent"
                        onClick={() => setActive(false)}
                    >
                        Отмена
                    </Button>
                </div>}
            />
        </>
    )
}

interface Props {
    competitionId: number
    className?: string
}
