import React, { FC, useEffect } from 'react'
import s from './index.module.scss'
import classNames from 'classnames'
import { svgIcons } from '../../lib/svgIcons'

const Popup: FC<IProps> = ({ active, setActive, title, content, actions, onClose }) => {
    const close = () => {
        setActive(false)
        onClose?.()
    }

    useEffect(() => {
        const escFunc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close()
            }
        }

        document.addEventListener('keydown', escFunc, false)
        return () => {
            document.removeEventListener('keydown', escFunc, false)
        }
    }, [])

    return (
        <div className={classNames(s.overflow, { [s.active]: active })} onClick={close}>
            <div className={s.modal} onClick={e => e.stopPropagation()}>
                <button className={s.close} onClick={close}>
                    {svgIcons.close}
                </button>
                <h2>{title}</h2>
                <div className={s.content}>{content}</div>
                {actions && <div className={s.actions}>{actions}</div>}
            </div>
        </div>
    )
}

export default Popup

interface IProps {
    active: boolean
    setActive: (value: boolean) => void
    title: React.ReactNode
    content: React.ReactNode
    actions?: React.ReactNode
    onClose?: () => void
}
