"use client"
import React from 'react'
import { useRoleStore } from '@/store/roleStore'

const MainHeader = () => {
    const { rolesCount } = useRoleStore()
    return (
        <div className="flex justify-between w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Roles ({rolesCount || 0})</h2>
        </div>
    )
}

export default MainHeader