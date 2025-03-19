export interface UserType {
    id: number
    username: string
    disabled: boolean
    is_admin: boolean
}

export const userRolesList = {
    'админ': 1,
    'секретарь': 2,
    'исполнение судья': 3,
    'артистичность судья': 4,
    'сложность судья': 5,
    'главный судья': 6,
    'арбитр': 7,
} as const

export type UserRoleTitle = keyof typeof userRolesList
export type UserRoleId = typeof userRolesList[UserRoleTitle]

export interface UserRole {
    id: UserRoleId
    title: UserRoleTitle
}

export interface UserByCompetition {
    id: number
    username: string
    disabled: boolean
    queue_index: number
    role: UserRole
}