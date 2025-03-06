import React from 'react'
import classNames from 'classnames'
import s from './index.module.scss'

const Tag: React.FC<TagProps> = ({ children, variant = 'info' }) => {
    return (
        <div className={classNames(s.tag, s[variant])}>
            {children}
        </div>
    )
}

export default Tag

export interface TagProps {
    children: React.ReactNode
    variant?: 'info' | 'success' | 'danger'
}