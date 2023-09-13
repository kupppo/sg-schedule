import { useEffect, useState } from 'react'

export const Twitch = ({ url }: { url: string }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const parent = window.location.hostname
  const originUrl = new URL(url)
  const startTime = originUrl.searchParams.get('t')
  const id = originUrl.pathname.replace('/videos/', '')
  const embedUrl = new URL('https://player.twitch.tv/')
  embedUrl.searchParams.set('video', `v${id}`)
  embedUrl.searchParams.set('parent', parent)
  embedUrl.searchParams.set('autoplay', 'false')
  if (startTime) {
    embedUrl.searchParams.set('time', startTime)
  }
  return (
    <div className="embed twitch-embed">
      <iframe
        src={embedUrl.toString()}
        allowFullScreen>
      </iframe>
    </div>
  )
}
