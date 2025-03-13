import { createContext, useContext } from 'react'
import { UserType } from './types'

export const UserContext = createContext<UserType | null>(null)

export const useCurrentUser = () => {
    return useContext(UserContext) as UserType
}