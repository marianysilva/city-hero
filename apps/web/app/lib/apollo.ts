import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from '@apollo/client'
import {
  registerApolloClient,
} from '@apollo/client-integration-nextjs'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000'

// RSC client — reads the token directly from the cookie for server-side queries.
export const { getClient, query: gqlQuery } = registerApolloClient(async () => {
  const store = await cookies()
  const token = store.get('access_token')?.value

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${BACKEND_URL}/graphql`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  })
})
