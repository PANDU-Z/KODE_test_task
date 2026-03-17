import { useMemo, useState } from 'react'

interface AvatarProps {
  src?: string
  firstName: string
  lastName: string
  alt: string
  className?: string
  fallbackClassName?: string
  wrapperClassName?: string
}

function Avatar({
  src,
  firstName,
  lastName,
  alt,
  className = '',
  fallbackClassName = '',
  wrapperClassName = '',
}: AvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const initials = useMemo(() => {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?'
  }, [firstName, lastName])

  return (
    <div className={wrapperClassName}>
      <div className={fallbackClassName}>{initials}</div>

      {src && !hasError && (
        <img
          className={`${className} ${isLoaded ? `${className}--visible` : ''}`}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}

export default Avatar