import React, { useEffect, useState } from 'react'
import { Competition } from '@/entities/competition'
import { getRoles, getUsersList, UserRole, UserType } from '@/entities/user'
import s from './index.module.scss'
import Select from '@/shared/ui/select'
import Button from '@/shared/ui/button'
import { svgIcons } from '@/shared/lib/svgIcons'

const RefereeingTeams: React.FC<{ competition: Competition }> = ({ competition }) => {
    const initialState = {

    }

    const [state, setState] = useState(initialState)

    const [users, setUsers] = useState<UserType[]>([])
    const [roles, setRoles] = useState<UserRole[]>([])

    useEffect(() => {
        getRoles()
            .then(res => setRoles(res))
            .catch(() => setRoles([]))

        getUsersList({ show_disabled: false })
            .then(res => setUsers(res))
            .catch(() => setUsers([]))
    }, [])

    return (
        <div className="flex flex-col gap-5">
            <div className="w-[500px]">
                <Select options={users.map(user => ({
                    value: user.id.toString(),
                    label: user.username,
                }))} label="Главный судья" />
            </div>
            <div className="flex gap-4">
                {Array(competition.queues_amount).fill('').map((_, i) => (
                    <div className={s.teem} key={i}>
                        <h3>Бригада {i + 1}</h3>
                        <div className={s.item}>
                            <Select options={[]} />
                            <Select options={roles.map(role => ({
                                value: role.id.toString(),
                                label: role.title,
                            }))} />
                            <button>{svgIcons.trash}</button>
                        </div>
                        <Button variant="transparent">+ Добавить</Button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RefereeingTeams