import React, { ChangeEventHandler, useRef, useState, useTransition } from 'react'
import s from './index.module.scss'
import Button from '@/shared/ui/button'
import { toast } from 'react-toastify'
import { uploadParticipants } from '../../actions/upload-participants'
import classNames from 'classnames'
import Popup from '../../../../shared/ui/popup'
import { Checkbox } from 'antd'

export const UploadParticipants: React.FC<Props> = ({ fetchParticipants, competitionId, className, isUpload }) => {
    const [active, setActive] = useState(false)

    const uploadInputRef = useRef<HTMLInputElement>(null)
    const fileRef = useRef<File>(null)
    const [isUploading, startTransition] = useTransition()

    const [isShuffle, setIsShuffle] = useState(false)
    const [isGeneratedFile, setIsGeneratedFile] = useState(false)

    const handleUpload: ChangeEventHandler<HTMLInputElement> = e => {
        if (e.target.files?.[0]) {
            setActive(true)
            fileRef.current = e.target.files?.[0]
        }
    }

    const upload = () => {
        setActive(false)

        startTransition(async () => {
            if (!fileRef.current) {
                return
            }

            try {
                await uploadParticipants(
                    competitionId,
                    fileRef.current,
                    { shuffle: isShuffle, file_format: isGeneratedFile ? 'generated' : 'normal' },
                )
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

    const cancel = () => {
        setActive(false)
        if (uploadInputRef.current) {
            uploadInputRef.current.value = ''
        }
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
                    setIsShuffle(false)
                    setIsGeneratedFile(false)
                }}
                title="Загрузка участников"
                content={
                    <div className="flex flex-col gap-2">
                        <Checkbox
                            value={isShuffle}
                            onChange={e => setIsShuffle(e.target.checked)}
                        >
                            Перемешать загружаемых участников
                        </Checkbox>
                        <Checkbox
                            value={isGeneratedFile}
                            onChange={e => setIsGeneratedFile(e.target.checked)}
                        >
                            Загрузка скаченного протокола
                        </Checkbox>
                    </div>
                }
                actions={<div className="grid grid-cols-2 gap-4">
                    <Button className="w-full" onClick={upload}>
                        Загрузить
                    </Button>
                    <Button
                        className="w-full"
                        variant="outlined"
                        onClick={cancel}
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
    fetchParticipants: () => void
    className?: string
    isUpload?: boolean
}
