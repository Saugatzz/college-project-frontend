import LoginModule from '@/components/login/LoginModule'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginModule />
      </Suspense>
    </div>
  )
}

export default page