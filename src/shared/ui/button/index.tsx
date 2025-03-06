import React, { HTMLProps } from 'react'
import classNames from 'classnames'
import s from './index.module.scss'

const Button: React.FC<Props> = ({
    className,
    variant = 'primary',
    type = 'button',
    asChild,
    children,
    ...rest
}) => {
    if (asChild) {
        return (
            <div className={classNames(s.btn, s[variant], className)}>
                {children}
            </div>
        )
    }

    return (
        <button
            type={type}
            className={classNames(s.btn, s[variant], className)}
            {...rest}
        >
            {children}
        </button>
    )
}

export default Button

interface Props extends Omit<HTMLProps<HTMLButtonElement>, 'type'> {
    variant?: 'primary' | 'secondary' | 'outlined' | 'transparent'
    type?: 'button' | 'submit' | 'reset'
    asChild?: boolean
    children: React.ReactNode
}
