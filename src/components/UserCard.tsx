import { Link } from 'react-router-dom'
import type { User } from '../types/user'
import Avatar from './Avatar'

interface UserCardProps {
  user: User
  birthdayLabel?: string
}

function UserCard({ user, birthdayLabel }: UserCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <li>
      <Link to={`/user/${user.id}`} className="user-card">
        <div className="user-card__left">
          <div className="user-card__avatar-wrapper">
            <Avatar
              src={user.avatarUrl}
              firstName={user.firstName}
              lastName={user.lastName}
              alt={fullName}
              wrapperClassName="user-card__avatar-wrapper"
              className="user-card__avatar"
              fallbackClassName="user-card__avatar-fallback"
            />
          </div>

          <div className="user-card__content">
            <div className="user-card__top">
              <span className="user-card__name">{fullName}</span>

              {user.userTag !== 'Не указано' && (
                <span className="user-card__tag">{user.userTag}</span>
              )}
            </div>

            <div className="user-card__position">{user.position}</div>
          </div>
        </div>

        {birthdayLabel && (
          <div className="user-card__birthday">{birthdayLabel}</div>
        )}
      </Link>
    </li>
  )
}

export default UserCard