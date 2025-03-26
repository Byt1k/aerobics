import React, { HTMLInputTypeAttribute, HTMLProps, useState } from 'react'
import classNames from 'classnames'
import s from './index.module.scss'
import { svgIcons } from '../../lib/svgIcons'
import { validateNumber } from '../../lib/number-validation-schema'

const Input: React.FC<Props> = ({
    label,
    isPassword,
    isError,
    errorMessage,
    className,
    onChange,
    type = 'text',
    value,
    ...rest
}) => {
    const [showPassword, setShowPassword] = useState(false)

    const handleChangeValue = (value: string) => {
        if (type === 'number') {
            onChange?.(validateNumber(value))
        } else {
            onChange?.(value)
        }
    }

    return (
        <div
            className={classNames(
                s.wrapper,
                { [s.error]: isError || !!errorMessage },
                className,
            )}
        >
            {label && <label>{label}</label>}
            <div className="relative w-full">
                <input
                    type={!showPassword && isPassword ? 'password' : type}
                    value={value}
                    onChange={e => handleChangeValue(e.target.value)}
                    {...rest}
                />
                {isPassword && (
                    <button
                        className={s.passwordIcon}
                        onClick={() => setShowPassword(prev => !prev)}
                        type="button"
                    >
                        {showPassword
                            ? svgIcons.password.visible
                            : svgIcons.password.hidden}
                    </button>
                )}
            </div>
            {errorMessage && <p className={s.errorMessage}>{errorMessage}</p>}
        </div>
    )
}

export default Input

interface Props
    extends Omit<Omit<HTMLProps<HTMLInputElement>, 'type'>, 'onChange'> {
    type?: HTMLInputTypeAttribute
    label?: string
    isPassword?: boolean
    isError?: boolean
    errorMessage?: string | null
    onChange?: (value: string) => void
}
