import React, { useCallback, useEffect, useState } from 'react'
import { getRoles, getUsersList, UserRole, UserType, UserByCompetition, userRolesList, UserRoleId } from '@/entities/user'
import { Competition, getUsersByCompetition, setUserToCompetition, unsetUserByCompetition } from '@/entities/competition'
import s from './index.module.scss'
import Select, { SelectOptionType } from '@/shared/ui/select'
import { toast } from 'react-toastify'

const RefereeingTeams: React.FC<{ competition: Competition }> = ({ competition }) => {
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
                    const arr1 = Array(4).fill({
                        id: null,
                        roleId: userRolesList['исполнение судья'],
                    })

                    const arr2 = Array(4).fill({
                        id: null,
                        roleId: userRolesList['артистичность судья'],
                    })

                    const arr3 = Array(1).fill({
                        id: null,
                        roleId: userRolesList['сложность судья'],
                    })

                    const arr4 = Array(1).fill({
                        id: null,
                        roleId: userRolesList['арбитр'],
                    })

                    result[q] = arr1.concat(arr2).concat(arr3).concat(arr4)
                }

                for (const user of response) {
                    if (user.role.id === userRolesList['главный судья']) {
                        setMainRefereeUserId(user.id)
                    } else {
                        const queue = user.queue_index
                        const index = result[queue].findIndex(u => u.roleId === user.role.id && !u.id)
                        result[queue].slice(index, 1)
                        result[queue].splice(index, 1, { roleId: user.role.id, id: user.id})
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

    const getFreeUsersWithCurrent = useCallback((currentUserId: number): SelectOptionType[] => {
        const freeUsers =  allUsers
            .filter(user => !usersByCompetitionList
                .some(userByCompetition => userByCompetition.id === user.id && userByCompetition.id !== currentUserId)
            )
        return freeUsers.map(user => ({ value: user.id.toString(), label: user.username }))
    }, [allUsers, usersByCompetitionList])

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

            fetchUsersByCompetition()
            toast.success('Сохранено')
        } catch {
            toast.error('Что-то пошло нет так')
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="w-[500px]">
                <Select
                    options={getFreeUsersWithCurrent(mainRefereeUserId ?? 0)}
                    label="Главный судья"
                    value={mainRefereeUserId?.toString()}
                    onChange={userId => userByCompetitionOnChange({
                        prevUserId: mainRefereeUserId ?? undefined,
                        userId: +userId,
                        roleId: userRolesList['главный судья'],
                    })}
                />
            </div>
            <div className="flex gap-4">
                {Object.entries(state).map(([queue, users]) => (
                    <div className={s.teem} key={queue}>
                        <h3>Бригада {queue}</h3>
                        {users.map((user, userIndex) => (
                            <div key={userIndex} className={s.item}>
                                <Select
                                    options={getFreeUsersWithCurrent(user.id ?? 0)}
                                    value={state[+queue][userIndex].id?.toString()}
                                    onChange={userId => userByCompetitionOnChange({
                                        prevUserId: state[+queue][userIndex].id || undefined,
                                        userId: +userId,
                                        roleId: state[+queue][userIndex].roleId,
                                        queueIndex: +queue,
                                        userIndex: userIndex,
                                    })}
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
}

interface UserByCompetitionPayload {
    prevUserId?: number
    userId?: number | null
    roleId?: UserRoleId | null
    queueIndex?: number
    userIndex?: number
}