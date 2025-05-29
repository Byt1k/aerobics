import React, { SetStateAction } from 'react'
import s from './index.module.scss'
import Button from '@/shared/ui/button'

export const Keyboard: React.FC<IProps> = ({ setValue, disabled }) => {
    const btns = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'Del'] as const

    const onChange = (v: typeof btns[number]) => {
        if (v === 'Del') {
            setValue(prev => prev.length > 0 ? prev.slice(0, -1) : prev)
        } else {
            setValue(prev => prev + v)
        }
    }

    return (
        <div className={s.keyboard}>
            {btns.map(value => (
                <Button
                    variant={"outlined"}
                    className={s.btn}
                    key={value}
                    onClick={() => onChange(value)}
                    disabled={disabled}
                >
                    {value === 'Del' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
                        </svg>
                    ) : value}
                </Button>
            ))}
        </div>
    )
}

interface IProps {
    setValue: React.Dispatch<SetStateAction<string>>
    disabled?: boolean
}