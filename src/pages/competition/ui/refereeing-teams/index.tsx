import React, { useCallback, useEffect, useState } from 'react'
import {
    getRoles,
    getUsersList,
    UserRole,
    UserType,
    UserByCompetition,
    userRolesList,
    UserRoleId,
    useCurrentUser,
} from '@/entities/user'
import {
    Competition,
    getUsersByCompetition,
    setUserToCompetition,
    unsetUserByCompetition,
} from '@/entities/competition'
import s from './index.module.scss'
import Select, { SelectOptionType } from '@/shared/ui/select'
import { toast } from 'react-toastify'
import { v4 as uuid } from 'uuid'

const RefereeingTeams: React.FC<{ competition: Competition }> = ({ competition }) => {
    const currentUser = useCurrentUser()

    const [allUsers, setAllUsers] = useState<UserType[]>([])
    const [usersByCompetitionList, setUsersByCompetitionList] = useState<UserByCompetition[]>([])
    const [roles, setRoles] = useState<UserRole[]>([])

    const [mainRefereeUserId, setMainRefereeUserId] = useState<number | null>(null)
    const [state, setState] = useState<State>({})

    const fetchUsersByCompetition = async () => {
        try {
            const response = await getUsersByCompetition(competition.id)

            if (response.length) {
                const result: State = {}

                for (let q = 1; q <= competition.queues_amount; q++) {
                    result[q] = []

                    const referees1 = [userRolesList['исполнение судья'], userRolesList['артистичность судья']]
                    referees1.forEach(roleId => {
                        for (let i = 0; i < 4; i++) {
                            result[q].push({
                                id: null,
                                roleId: roleId,
                                fieldId: uuid(),
                            })
                        }
                    })

                    const referees2 = [userRolesList['сложность судья'], userRolesList['арбитр']]
                    referees2.forEach(roleId => {
                        result[q].push({
                            id: null,
                            roleId: roleId,
                            fieldId: uuid(),
                        })
                    })
                }

                for (const user of response) {
                    if (user.role.id === userRolesList['главный судья']) {
                        setMainRefereeUserId(user.id)
                    } else {
                        const queue = user.queue_index
                        const index = result[queue].findIndex(u => u.roleId === user.role.id && !u.id)
                        result[queue].slice(index, 1)
                        result[queue].splice(index, 1, {
                            roleId: user.role.id,
                            id: user.id,
                            fieldId: uuid(),
                        })
                    }
                }
                setState(result)
            }
            setUsersByCompetitionList(response)
        } catch {
            //
        }
    }

    useEffect(() => {
        getRoles()
            .then(res => setRoles(res))
            .catch(() => setRoles([]))

        getUsersList({ show_disabled: false })
            .then(res => setAllUsers(res))
            .catch(() => setAllUsers([]))

        fetchUsersByCompetition()
    }, [])

    const getFreeUsersWithSelected = useCallback((selectedUserId: number): SelectOptionType[] => {
        const freeUsers =  allUsers
            .filter(user => user.id !== currentUser.id &&
                !usersByCompetitionList.some(userByCompetition =>
                    userByCompetition.id === user.id && userByCompetition.id !== selectedUserId
                )
            )
        return freeUsers.map(user => ({ value: user.id.toString(), label: user.username }))
    }, [allUsers, usersByCompetitionList, currentUser])

    const userByCompetitionOnChange = async ({ prevUserId, userId, roleId, queueIndex, userIndex }: UserByCompetitionPayload) => {
        if (userId && !roleId && queueIndex) {
            setState(prev => ({
                ...prev,
                [queueIndex]: prev[queueIndex].map((user, i) => {
                    if (i === userIndex) {
                        return {
                            ...prev[queueIndex][i],
                            id: userId
                        }
                    }
                    return user
                })
            }))

            return
        }

        if (roleId && !userId && queueIndex) {
            setState(prev => ({
                ...prev,
                [queueIndex]: prev[queueIndex].map((user, i) => {
                    if (i === userIndex) {
                        return {
                            ...prev[queueIndex][i],
                            roleId: roleId
                        }
                    }
                    return user
                })
            }))

            return
        }

        if (!userId || !roleId) return


        try {
            if (prevUserId && usersByCompetitionList
                .some(user => user.id === prevUserId)
            ) {
                await unsetUserByCompetition(prevUserId, competition.id)
            }

            await setUserToCompetition({
                roleId, userId, competitionId: competition.id, queueIndex
            })

            // fetchUsersByCompetition()
            toast.success('Сохранено')
        } catch {
            toast.error('Что-то пошло нет так')
        }
    }

    const deleteUserByCompetition = async (userId: string) => {
        try {
            await unsetUserByCompetition(+userId, competition.id)
            fetchUsersByCompetition()
            toast.success('Сохранено')
        } catch {
            toast.error('Что-то пошло нет так')
        }
    }

    console.log(state)

    return (
        <div className="flex flex-col gap-5">
            <div className="w-[500px]">
                <Select
                    options={getFreeUsersWithSelected(mainRefereeUserId ?? 0)}
                    label="Главный судья"
                    value={mainRefereeUserId?.toString()}
                    onChange={userId => userByCompetitionOnChange({
                        prevUserId: mainRefereeUserId ?? undefined,
                        userId: +userId!,
                        roleId: userRolesList['главный судья'],
                    })}
                    search
                />
            </div>
            <div className="flex gap-4">
                {Object.entries(state).map(([queue, users]) => (
                    <div className={s.teem} key={queue}>
                        <h3>Бригада {queue}</h3>
                        {users.map((user, userIndex) => (
                            <div key={user.fieldId} className={s.item}>
                                <Select
                                    options={getFreeUsersWithSelected(user.id ?? 0)}
                                    value={user.id?.toString()}
                                    onChange={userId => userByCompetitionOnChange({
                                        prevUserId: user.id || undefined,
                                        userId: +userId!,
                                        roleId: user.roleId,
                                        queueIndex: +queue,
                                        userIndex: userIndex,
                                    })}
                                    allowClear
                                    onClear={deleteUserByCompetition}
                                    search
                                />
                                <Select
                                    options={roles
                                        .filter(r => r.title !== 'админ' && r.title !== 'секретарь' && r.title !== 'главный судья')
                                        .map(role => ({
                                            value: role.id.toString(),
                                            label: role.title,
                                        }))
                                    }
                                    value={state[+queue][userIndex].roleId?.toString()}
                                    locked
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RefereeingTeams

type State = Record<number, UserByState[]>

interface UserByState {
    id: number | null
    roleId: UserRoleId
    fieldId: string
}

interface UserByCompetitionPayload {
    prevUserId?: number
    userId?: number | null
    roleId?: UserRoleId | null
    queueIndex?: number
    userIndex?: number
}