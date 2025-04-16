import React from 'react'
import { LoadingSpinner } from '../ui/loading-spinner'
import Error from '@/app/error'

function StatusWrapper(props: React.PropsWithChildren<{ error?: string | null, loading?: boolean,className?: string }>) {
    const { error, loading } = props
    if (loading) {
        return <LoadingSpinner className={`${props.className || ''}`} />
    }
    if (error) {
        return <Error error={error} reset={() => window.location.reload()} className={`${props.className || ''}`} />
    }
    if (!error && !loading) {
        return <div className={`${props.className || ''}`}>{props.children}</div>
    }
}

export default StatusWrapper
