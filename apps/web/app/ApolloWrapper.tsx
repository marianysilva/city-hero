'use client'

import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs'
import { HttpLink } from '@apollo/client'

// Client-side Apollo — routes through /api/graphql so the HttpOnly cookie
// is forwarded automatically (same-origin, credentials: 'same-origin').
function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: '/api/graphql',
      credentials: 'same-origin',
    }),
  })
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
