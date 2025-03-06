import React from 'react'

export const createChangeStateHandler =
    <T>(setState:  React.Dispatch<React.SetStateAction<T>>) =>
        <K extends keyof T>(key: K, value: T[K]) => {
            setState(prev => ({
                ...prev,
                [key]: value,
            }))
}