'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function SessionInfo() {
  const { data: session, status } = useSession()

  useEffect(() => {
    
  }, [session, status])

  if (status === "loading") {
    return <div>Đang tải...</div>
  }

  if (!session) {
    return <div>Chưa đăng nhập</div>
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Thông tin phiên đăng nhập</h2>
      <div className="mb-4">
        <p>Trạng thái: {status}</p>
      </div>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
}