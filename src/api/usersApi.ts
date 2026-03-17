import axios from 'axios'
import type { User } from '../types/user'

const API_URL =
  'https://stoplight.io/mocks/kode-frontend-team/koder-stoplight/86566464/users?__example=all'
  // 'https://example.com/wrong'

interface UsersResponse {
  items: User[]
}

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get<UsersResponse>(API_URL, {
    timeout: 5000,
  })

  return response.data.items
}