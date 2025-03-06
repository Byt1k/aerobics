import React, { ChangeEventHandler, useRef, useTransition } from 'react'
import s from './index.module.scss'
import Button from '@/shared/ui/button'
import { toast } from 'react-toastify'
import { uploadParticipants } from '../../actions/upload-participants'

export const UploadParticipantsInput: React.FC<Props> = ({ fetchParticipants, competitionId }) => {
    const uploadInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, startTransition] = useTransition()

    const handleUpload: ChangeEventHandler<HTMLInputElement> = e => {
        const file = e.target.files?.[0]!

        startTransition(async () => {
            try {
                await uploadParticipants(competitionId, file)
                toast.success('Данные загружены')
                fetchParticipants()
            } catch {
                toast.error('Не удалось загрузить данные')
            }
        })

        if (uploadInputRef.current) {
            uploadInputRef.current.value = ''
        }
    }

    return (
        <Button className={s.upload} disabled={isUploading}>
            <label className="w-full h-full flex items-center justify-center">
                <input
                    type="file"
                    ref={uploadInputRef} onChange={handleUpload}
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    disabled={isUploading}
                />
                Загрузить
            </label>
        </Button>
    )
}

interface Props {
    competitionId: number
    fetchParticipants: () => void
}
