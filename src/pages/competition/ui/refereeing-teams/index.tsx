import React, { useCallback, useEffect, useState } from 'react'
import { getRoles, getUsersList, UserRole, UserType, UserByCompetition, userRolesList, UserRoleId } from '@/entities/user'
import { Competition, getUsersByCompetition, setUserToCompetition, unsetUserByCompetition } from '@/entities/competition'
import s from './index.module.scss'
import Select, { SelectOptionType } from '@/shared/ui/select'
import Button from '@/shared/ui/button'
import { svgIcons } from '@/shared/lib/svgIcons'
import { toast } from 'react-toastify'

const RefereeingTeams: React.FC<{ competition: Competition }> = ({ competition }) => {
    const [allUsers, setAllUsers] = useState<UserType[]>([])
    const [usersByCompetitionList, setUsersByCompetitionList] = useState<UserByCompetition[]>([])
    const [roles, setRoles] = useState<UserRole[]>([])

    const [mainRefereeUserId, setMainRefereeUserId] = useState<number | null>(null)
    const [state, setState] = useState<State>({})

    const fetchUsersByCompetition = async () => {
        try {
            const res = await getUsersByCompetition(competition.id)

            if (res.length) {
                const result: State = {}

                for (let q = 1; q <= competition.queues_amount; q++) {
                    result[q] = []
                }

                for (const user of res) {
                    if (user.role.id === userRolesList['главный судья']) {
                        setMainRefereeUserId(user.id)
                    } else if (result[user.queue_index]) {
                        result[user.queue_index].push({
                            roleId: user.role.id,
                            id: user.id
                        })
                    } else {
                        result[user.queue_index] = [{
                            roleId: user.role.id,
                            id: user.id
                        }]
                    }
                }

                console.log('result', result)

                setState(result)
            }
            setUsersByCompetitionList(res)
        } catch (e) {
            console.log(e)
        }
    }

    console.log('state', state)

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

    const deleteUserByCompetition = async (userId: number) => {
        try {
            await unsetUserByCompetition(userId, competition.id)
            toast.success('Удалено!')
        } catch {
            toast.error('Что-то пошло нет так')
        }

        fetchUsersByCompetition()
    }

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
                            <div key={user.id} className={s.item}>
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
                                    onChange={roleId => userByCompetitionOnChange({
                                        prevUserId: state[+queue][userIndex].id || undefined,
                                        userId: state[+queue][userIndex].id,
                                        roleId: +roleId as UserRoleId,
                                        queueIndex: +queue,
                                        userIndex: userIndex,
                                    })}
                                />
                                <button onClick={() => {
                                    if (usersByCompetitionList.some(({ id }) => id === user.id)) {
                                        deleteUserByCompetition(user.id ?? 0)
                                    } else {
                                        setState(prev => ({
                                            ...prev,
                                            [queue]: prev[+queue].filter((_, i) => i !== userIndex)
                                        }))
                                    }
                                }}>
                                    {svgIcons.trash}
                                </button>
                            </div>
                        ))}
                        <Button
                            variant="transparent"
                            onClick={() => setState(prev => ({
                                ...prev,
                                [queue]: [...prev[+queue], { roleId: null, id: null }]
                            }))}
                            disabled={state[+queue].length > 0 && (!state[+queue][state[+queue].length - 1].id || !state[+queue][state[+queue].length - 1].roleId)}
                        >
                            + Добавить
                        </Button>
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
    roleId: UserRoleId | null
}

interface UserByCompetitionPayload {
    prevUserId?: number
    userId?: number | null
    roleId?: UserRoleId | null
    queueIndex?: number
    userIndex?: number
}