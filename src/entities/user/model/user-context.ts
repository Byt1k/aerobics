import React, { createContext } from 'react'
import { UserType } from './types'

export const UserContext = createContext<UserContextType>({} as UserContextType)

interface UserContextType {
    user: UserType | null
    setUser: React.Dispatch<React.SetStateAction<UserType | null>>
}