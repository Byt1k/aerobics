import React from 'react'
import { DatePicker } from 'antd'
import type { GetProps } from 'antd'
import ru_RU from 'antd/locale/ru_RU'
import s from '../input-range-datetime/index.module.scss'
import { svgIcons } from '../../lib/svgIcons'
import dayjs from 'dayjs'

type RangePickerProps = GetProps<typeof DatePicker.RangePicker>

const { RangePicker } = DatePicker

const InputRangeDateTime: React.FC<Props> = ({
    value: { startDate, endDate },
    onChange,
    showTime,
    required,
    label,
}) => {
    const changeValue = (value: RangePickerProps['value']) => {
        onChange({
            startDate: value?.[0] ? value[0].format('YYYY-MM-DD HH:mm') : null,
            endDate: value?.[1] ? value[1].format('YYYY-MM-DD HH:mm') : null,
        })
    }

    return (
        <div className={s.dateTimePicker}>
            <label>{label}</label>
            <RangePicker
                showTime={showTime ? { format: 'HH:mm' } : undefined}
                format={showTime ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY'}
                value={[
                    startDate ? dayjs(startDate) : null,
                    endDate ? dayjs(endDate) : null,
                ]}
                required={required}
                onChange={changeValue}
                onOk={changeValue}
                locale={ru_RU.DatePicker}
                suffixIcon={svgIcons.calendar}
                rootClassName={s.root}
                dropdownClassName={s.dropdown}
            />
        </div>
    )
}

export default InputRangeDateTime

interface Props {
    value: DateTimeValueType
    onChange: (value: DateTimeValueType) => void
    showTime?: boolean
    required?: boolean
    isValid?: boolean
    label: string
}

export interface DateTimeValueType {
    startDate: string | null
    endDate: string | null
}
