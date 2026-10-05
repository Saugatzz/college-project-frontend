import UserLoginModule from '@/components/user/UserLoginModule'
import React, { Suspense } from 'react'

// useSearchParams() inside UserLoginModule needs a Suspense boundary,
// otherwise `next build` fails on this route and the page ends up 404.
const page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mist" />}>
      <UserLoginModule />
    </Suspense>
  )
}

export default page
