import UserSignupModule from '@/components/user/UserSignupModule'
import React, { Suspense } from 'react'

// useSearchParams() inside UserSignupModule needs a Suspense boundary,
// otherwise `next build` fails on this route and the page ends up 404.
const page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mist" />}>
      <UserSignupModule />
    </Suspense>
  )
}

export default page
