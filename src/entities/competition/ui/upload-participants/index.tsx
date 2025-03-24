import React, { ChangeEventHandler, useRef, useState, useTransition } from 'react'
import s from './index.module.scss'
import Button from '@/shared/ui/button'
import { toast } from 'react-toastify'
import { uploadParticipants } from '../../actions/upload-participants'
import classNames from 'classnames'
import Popup from '../../../../shared/ui/popup'

export const UploadParticipants: React.FC<Props> = ({ fetchParticipants, competitionId, className, isUpload }) => {
    const [active, setActive] = useState(false)

    const uploadInputRef = useRef<HTMLInputElement>(null)
    const fileRef = useRef<File>(null)
    const [isUploading, startTransition] = useTransition()

    const handleUpload: ChangeEventHandler<HTMLInputElement> = e => {
        if (e.target.files?.[0]) {
            setActive(true)
            fileRef.current = e.target.files?.[0]
        }
    }

    const upload = (isShuffle: boolean) => {
        setActive(false)

        startTransition(async () => {
            if (!fileRef.current) {
                return
            }

            try {
                await uploadParticipants(competitionId, fileRef.current, isShuffle)
                toast.success('Данные загружены')
                fetchParticipants()
            } catch {
                toast.error('Не удалось загрузить данные')
            } finally {
                if (uploadInputRef.current) {
                    uploadInputRef.current.value = ''
                }
            }
        })
    }

    return (
        <>
            <Button className={classNames(s.upload, className)} disabled={isUploading}>
                <label className="w-full h-full flex items-center justify-center">
                    <input
                        type="file"
                        ref={uploadInputRef}
                        onChange={handleUpload}
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        disabled={isUploading}
                    />
                    {isUpload ? 'Обновить' : 'Загрузить'}
                </label>
            </Button>
            <Popup
                active={active}
                setActive={setActive}
                onClose={() => {
                    if (uploadInputRef.current) {
                        uploadInputRef.current.value = ''
                    }
                }}
                title="Перемешать загружаемых участников?"
                content={<div className="grid grid-cols-2 gap-4 mt-8">
                    <Button className="w-full" onClick={() => upload(true)}>
                        Да
                    </Button>
                    <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => upload(false)}
                    >
                        Нет
                    </Button>
                </div>}
            />
        </>
    )
}

interface Props {
    competitionId: number
    fetchParticipants: () => void
    className?: string
    isUpload?: boolean
}
