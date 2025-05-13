import { ReactElement, ReactNode } from 'react'
import s from './index.module.scss'
import classNames from 'classnames'

const Table = <T,>({
    data,
    columns,
    rowDisable,
    className,
    loading
}: IProps<T>): ReactElement => {
    return (
        <table className={classNames(s.table, className)}>
            <thead>
                <tr>
                    {columns?.map(column => (
                        <td key={column.key} colSpan={column.colSpan}>{column.name}</td>
                    ))}
                </tr>
            </thead>
            <tbody>
                {!data?.length && loading && (
                    <tr>
                        <td colSpan={columns.length}>
                            <p style={{ fontWeight: 400 }}>Загрузка...</p>
                        </td>
                    </tr>
                )}

                {!data?.length && !loading && (
                    <tr>
                        <td colSpan={columns.length}>
                            <p style={{ fontWeight: 400 }}>Данных нет</p>
                        </td>
                    </tr>
                )}

                {data?.map((row, rowIndex) => (
                    <tr
                        key={rowIndex}
                        className={classNames({
                            [s.disable]: rowDisable?.(row),
                        })}
                    >
                        {columns?.map((column, columnIndex) => (
                            <td key={column.key} colSpan={column.colSpan} className={columns[columnIndex].className}>
                                <span className={s.mobileHead}>
                                    {columns[columnIndex].name}
                                </span>
                                {column.render
                                    ? column.render(data[rowIndex])
                                    : data[rowIndex][column.dataIndex!] as ReactNode}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Table

interface IProps<T> {
    columns: TableColumns<T>
    data: T[]
    className?: string
    rowDisable?: (record: T) => boolean
    loading?: boolean
}

export type TableColumns<T> = Array<{
    name?: string
    dataIndex?: keyof T
    key: string
    render?: (record: T) => ReactNode
    colSpan?: number
    className?: string
}>
