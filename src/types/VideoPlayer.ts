type VideoPlayerProps = {
  src: string
  thumbnail?: string // TODO: add thumbnail
  title?: string // TODO: add title
  width?: number
  height?: number
  autoplay?: boolean // TODO: add autoplay
  controls?: boolean
  loop?: boolean // TODO: add loop
  muted?: boolean // TODO: add muted
  volume?: number // TODO: add volume
  playbackRate?: number // TODO: add playbackRate
  onPlay?: () => void // TODO: add onPlay
  onPause?: () => void // TODO: add onPause
  onEnded?: () => void // TODO: add onEnded
  onTimeUpdate?: (time: number) => void // TODO: add onTimeUpdate
  onVolumeChange?: (volume: number) => void // TODO: add onVolumeChange
  style?: React.CSSProperties
}

export type { VideoPlayerProps }