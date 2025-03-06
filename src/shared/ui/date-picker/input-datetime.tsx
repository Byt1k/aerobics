import React from 'react'
import { DatePicker, DatePickerProps } from 'antd'
import ru_RU from 'antd/locale/ru_RU'
import s from './index.module.scss'
import { svgIcons } from '../../lib/svgIcons'
import dayjs from 'dayjs'

const InputDateTime: React.FC<Props> = ({
    value,
    onChange,
    showTime,
    required,
    label,
}) => {
    const changeValue: DatePickerProps['onChange'] = (value, dateString) => {
        onChange(value.format('YYYY-MM-DD'))
    }

    return (
        <div className={s.dateTimePicker}>
            <label>{label}</label>
            <DatePicker
                showTime={showTime ? { format: 'HH:mm' } : undefined}
                format={showTime ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY'}
                value={value ? dayjs(value, 'YYYY-MM-DD') : null}
                required={required}
                onChange={changeValue}
                locale={ru_RU.DatePicker}
                suffixIcon={svgIcons.calendar}
                rootClassName={s.root}
            />
        </div>
    )
}

export default InputDateTime

interface Props {
    value: string | null
    onChange: (value: string) => void
    showTime?: boolean
    required?: boolean
    isValid?: boolean
    label: string
}

export interface DateTimeValueType {
    startDate: string | null
    endDate: string | null
}
