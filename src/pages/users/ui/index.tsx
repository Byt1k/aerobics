import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '@/shared/ui/button'
import Table, { TableColumns } from '@/shared/ui/table'
import s from './index.module.scss'
import { UserType, useCurrentUser, UserEditorPopup,  deleteUserAction, getUsersList } from '@/entities/user'
import { toast } from 'react-toastify'

export const UsersPage = () => {
    const currentUser = useCurrentUser()
    const [usersList, setUsersList] = useState<UserType[]>([])

    const fetchUsers = () => {
        getUsersList({ show_disabled: false }).then(res => setUsersList(res))
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const [editorOpened, setEditorOpened] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

    const editUser = (user: UserType) => {
        setSelectedUser(user)
        setEditorOpened(true)
    }

    const [isDeleting, setIsDeleting] = useState<number[]>([])

    const deleteUser = useCallback(async (userId: number) => {
        setIsDeleting(prev => [...prev, userId])

        try {
            await deleteUserAction(userId)
            fetchUsers()
            toast.success('Пользователь удален')
        } catch {
            toast.error('Не удалось удалить пользователя')
        } finally {
            setIsDeleting(prev => prev.filter(id => id !== userId))
        }
    }, [])

    const columns: TableColumns<UserType> = useMemo(() => [
        {
            name: 'ФИО',
            key: 'username',
            dataIndex: 'username',
        },
        {
            key: 'actions',
            render: user => (
                <div className="flex justify-end gap-2">
                    <Button variant="outlined" className={s.tableBtn} onClick={() => editUser(user)}>Редактировать</Button>
                    {currentUser?.id !== user.id && !user.is_translation && (
                        <Button
                            variant="secondary"
                            className={s.tableBtn}
                            onClick={() => deleteUser(user.id)}
                            disabled={isDeleting.some(id => id == user.id)}
                        >
                            Удалить
                        </Button>
                    )}
                </div>
            )
        }
    ], [isDeleting, currentUser, deleteUser])

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1>Пользователи</h1>
                <Button onClick={() => setEditorOpened(true)}>
                    Добавить пользователя
                </Button>
            </div>

            <Table<UserType> columns={columns} data={usersList} />

            <UserEditorPopup
                active={editorOpened}
                setActive={setEditorOpened}
                selected={selectedUser}
                setSelected={setSelectedUser}
                updateUsersList={fetchUsers}
            />
        </div>
    )
}
