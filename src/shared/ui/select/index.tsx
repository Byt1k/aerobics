import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import s from './index.module.scss'
import { useClickOutside } from '../../lib/click-outside'
import { svgIcons } from '../../lib/svgIcons'

const Select: React.FC<Props> = ({
    label,
    isError,
    errorMessage,
    value: defaultValue,
    onChange,
    className,
    options,
    name,
    disabled,
    locked,
}) => {
    const { ref, active, setActive } = useClickOutside()

    const [value, setValue] = useState(defaultValue ?? '')

    useEffect(() => {
        setValue(defaultValue ?? '')
    }, [defaultValue])

    const handleOnChange = (value: string) => {
        setValue(value)
        onChange?.(value)
        setActive(false)
    }

    return (
        <div className={classNames(s.wrapper, className)}>
            <input type="hidden" name={name} value={value} />

            {label && <label>{label}</label>}

            <div
                className={classNames(
                    s.select,
                    { [s.opened]: active },
                    { [s.disabled]: disabled },
                    { [s.error]: isError || !!errorMessage },
                    { [s.locked]: locked },
                )}
                ref={ref}
            >
                <div className={s.value} onClick={() => setActive(prev => !prev)}>
                    {!value ? (
                        <span className={s.placeholder}>Не выбрано</span>
                    ) : (
                        options?.find(item => item.value === value)?.label
                    )}

                    <i className={classNames(s.icon, s.dropdownIcon)}>
                        {svgIcons.dropdown}
                    </i>

                </div>

                <div className={s.dropdown}>
                    {options.map(item => (
                        <div
                            key={item.value}
                            className={classNames(s.item, { [s.selected]: item.value === value })}
                            onClick={() => handleOnChange(item.value)}
                        >
                            {item.label}
                            {item.value === value && (
                                <i className={s.icon}>{svgIcons.check}</i>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {errorMessage && <p className={s.errorMessage}>{errorMessage}</p>}
        </div>
    )
}

export default Select

interface Props {
    label?: string
    isError?: boolean
    errorMessage?: string
    value?: string
    onChange?: (value: string) => void
    locked?: boolean
    className?: string
    options: SelectOptionType[]
    name?: string
    disabled?: boolean
}

export interface SelectOptionType {
    value: string
    label: string
}
