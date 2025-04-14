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
    allowClear,
    onClear,
    search,
}) => {
    const { ref, active, setActive } = useClickOutside()

    const [value, setValue] = useState(defaultValue ?? '')
    const [searchValue, setSearchvalue] = useState('')

    useEffect(() => {
        setValue(defaultValue ?? '')
    }, [defaultValue])

    const handleOnChange = (value: string | undefined) => {
        setValue(value ?? '')
        setSearchvalue('')
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
                    <input
                        type="text"
                        value={options?.find(item => item.value === value)?.label}
                        onChange={e => setSearchvalue(e.target.value)}
                        placeholder="Не выбрано"
                        readOnly={!search}
                    />

                    {allowClear && !!value ? (
                        <button
                            className={s.icon}
                            onClick={() => {
                                handleOnChange(undefined)
                                onClear?.(value)
                            }}
                        >
                            {svgIcons.close}
                        </button>
                    ) : (
                        <i className={classNames(s.icon, s.dropdownIcon)}>
                            {svgIcons.dropdown}
                        </i>
                    )}

                </div>

                <div className={s.dropdown}>
                    {options
                        .filter(item => item.label.toLowerCase().includes(searchValue.toLowerCase()))
                        .map(item => (
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
                        ))
                    }
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
    onChange?: (value: string | undefined) => void
    locked?: boolean
    className?: string
    options: SelectOptionType[]
    name?: string
    disabled?: boolean
    allowClear?: boolean
    onClear?: (v: string) => void
    search?: boolean
}

export interface SelectOptionType {
    value: string
    label: string
}
