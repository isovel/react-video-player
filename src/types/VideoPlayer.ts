type Source = {
  src: string;
  type?: string;
}

type VideoPlayerProps = {
  source: Source | Source[]
  thumbnail?: string
  title?: string
  width?: number
  height?: number
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  volume?: number
  playbackRate?: number
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (time: number) => void
  onVolumeChange?: (volume: number) => void
  onPlaybackRateChange?: (playbackRate: number) => void
  style?: React.CSSProperties
}

export type { VideoPlayerProps }