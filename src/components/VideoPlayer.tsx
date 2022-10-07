import { faCompress, faExpand, faPause, faPlay, faVolumeMute, faVolumeUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { MouseEvent, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"
import { VideoPlayerProps } from "../types/VideoPlayer"

const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time - (hours * 3600)) / 60)
  const seconds = Math.floor(time - (hours * 3600) - (minutes * 60))

  return `${hours > 0 ? `${hours}:` : ""}${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}

const sanitizeTime = (time: number) => isNaN(time) ? 0 : time < 0 ? 0 : time

const sanitizeVolume = (volume: number) => isNaN(volume) ? 0 : volume < 0 ? 0 : volume > 1 ? 1 : volume

const sanitizePlaybackRate = (playbackRate: number) => isNaN(playbackRate) ? 1 : playbackRate <= 0 ? 0 : playbackRate > 16 ? 16 : playbackRate

const baseState = {
  isPlaying: false,
  isMuted: false,
  isFullscreen: false,
  isHovered: true,
  shouldTransitionHover: false,
  visualProgress: 0,
  actualProgress: 0,
  buffer: [{
    start: 0,
    end: 0,
  }],
  duration: 0,
  playbackRate: 1,
  volume: 0.5,
  isVolumeHovered: false,
  dragState: {
    value: [0, 0],
    wasPlaying: false,
  }
}

const VideoPlayer = (props: VideoPlayerProps) => {
  const videoElement = useRef<HTMLVideoElement>(null)
  const combinedBaseState = useMemo(() => ({
    ...baseState,
    isMuted: props.muted ?? baseState.isMuted,
    playbackRate: props.playbackRate ?? baseState.playbackRate,
    volume: sanitizeVolume(props.volume ?? baseState.volume),
  }), [props.muted, props.playbackRate, props.volume])
  const [playerState, setPlayerState] = useState(combinedBaseState)

  const getFormattedProgress = () => formatTime(playerState.visualProgress)
  const getTotalTime = () => formatTime(playerState.duration)

  useEffect(() => {
    setPlayerState(combinedBaseState)
  }, [combinedBaseState, props.source])

  useEffect(() => {
    props.onPlaybackRateChange && props.onPlaybackRateChange(playerState.playbackRate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerState.playbackRate, props.onPlaybackRateChange])

  useEffect(() => {
    playerState.isPlaying
      ? videoElement.current!.play()
      : videoElement.current!.pause()
  }, [playerState.isPlaying])

  useEffect(() => {
    videoElement.current!.playbackRate = sanitizePlaybackRate(playerState.playbackRate)
  }, [playerState.playbackRate])

  useEffect(() => {
    videoElement.current!.volume = sanitizeVolume(playerState.volume)
  }, [playerState.volume])

  useEffect(() => {
    playerState.isFullscreen
      ? videoElement.current!.parentElement!.parentElement!.requestFullscreen()
      : document.fullscreenElement && document.exitFullscreen()
  }, [playerState.isFullscreen])

  useEffect(() => {
    videoElement.current!.currentTime = sanitizeTime(playerState.actualProgress)
  }, [playerState.actualProgress])

  useEffect(() => {
    if (!playerState.isHovered) {
      setPlayerState(state => ({
        ...state,
        shouldTransitionHover: true
      }))
      const timeout = setTimeout(() => {
        setPlayerState(state => ({
          ...state,
          shouldTransitionHover: false
        }))
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [playerState.isHovered])

  const seek = useCallback((time: number) => {
    time = time < 0 ? 0 : time
    time = time > playerState.duration ? playerState.duration : time
    setPlayerState(state => ({
      ...state,
      actualProgress: Number(time),
      visualProgress: Number(time)
    }))
  }, [playerState.duration])

  useEffect(() => {
    seek(playerState.dragState.value[0])
  }, [playerState.dragState.value, seek])

  const togglePlaying = () => {
    setPlayerState({
      ...playerState,
      isPlaying: !playerState.isPlaying,
    })
  }

  const play = () => {
    setPlayerState({
      ...playerState,
      isPlaying: true,
    })
  }

  const pause = () => {
    setPlayerState({
      ...playerState,
      isPlaying: false,
    })
  }

  const toggleMuted = () => {
    setPlayerState({
      ...playerState,
      isMuted: !playerState.isMuted,
    })
  }

  const handleSeek = (e: MouseEvent<HTMLDivElement>, type: 'click' | 'drag') => {
    type === 'drag' && (e as any).dataTransfer.setDragImage(e.currentTarget, -99999, -99999)
    const { clientX } = e.nativeEvent
    const { left, width } = type === 'click'
      ? e.currentTarget.getBoundingClientRect()
      : e.currentTarget.parentElement!.parentElement!.getBoundingClientRect()
    const progress = (Math.min(Math.max(clientX, left), left + width) - left) / width
    setPlayerState({
      ...playerState,
      dragState: {
        ...playerState.dragState,
        value: [
          type === 'click'
            ? progress * playerState.duration
            : playerState.dragState.value[1],
          progress * playerState.duration]
      }
    })
  }
  const handleClickSeek = (e: MouseEvent<HTMLDivElement>) => handleSeek(e, 'click')
  const handleDragSeek = (e: MouseEvent<HTMLDivElement>) => handleSeek(e, 'drag')

  const handleOnTimeUpdate = (e: SyntheticEvent<HTMLVideoElement>) => {
    const { currentTime, duration, buffered } = e.currentTarget
    const buffer = [...Array(buffered.length).keys()].map(index => ({
      start: buffered.start(index),
      end: buffered.end(index)
    }))
    setPlayerState({
      ...playerState,
      visualProgress: sanitizeTime(currentTime),
      duration: sanitizeTime(duration),
      buffer
    })
    props.onTimeUpdate?.(sanitizeTime(currentTime))
  }

  const handleEnded = (e: SyntheticEvent<HTMLVideoElement>) => {
    setPlayerState({
      ...playerState,
      isPlaying: false,
    })
    props.onEnded?.()
  }

  const toggleFullscreen = () => {
    setPlayerState({
      ...playerState,
      isFullscreen: !playerState.isFullscreen,
    })
  }

  const shouldShowOverlays = useMemo(
    () => !playerState.isPlaying || playerState.isHovered || playerState.shouldTransitionHover,
    [playerState.isPlaying, playerState.isHovered, playerState.shouldTransitionHover]
  )

  return (
    <VideoContainer
      style={{
        width: props.width,
        height: props.height,
        ...props.style,
      }}
      onMouseEnter={() => setPlayerState({ ...playerState, isHovered: true })}
      onMouseLeave={() => setPlayerState({ ...playerState, isHovered: false })}
      hoverTransition={(!(!playerState.isPlaying || playerState.isHovered) && playerState.shouldTransitionHover)}
      fullscreen={playerState.isFullscreen}
    >
      <VideoWrapper onClick={togglePlaying}>
        <Video
          ref={videoElement}
          preload="metadata"
          poster={props.thumbnail}
          loop={props.loop}
          muted={playerState.isMuted}
          onPlay={props.onPlay}
          onPause={props.onPause}
          onEnded={handleEnded}
          onTimeUpdate={handleOnTimeUpdate}
          onDurationChange={handleOnTimeUpdate}
          onVolumeChange={(e) => props.onVolumeChange?.(e.currentTarget.volume)}
        >
          {props.source instanceof Array ? props.source.map(({ src, type }, index) => (
            <source key={index} src={src} type={type} />
          )) : (
            <source src={props.source.src} type={props.source.type} />
          )}
          Your browser does not support videos. Maybe try a different browser?
        </Video>
      </VideoWrapper>
      {props.title && shouldShowOverlays && (
        <VideoTitle>{props.title}</VideoTitle>
      )}
      {(props.controls ?? true) && shouldShowOverlays && (
        <VideoOverlay>
          <PlayerIcon
            icon={playerState.isPlaying ? faPause : faPlay}
            onClick={togglePlaying}
            fixedWidth
          />
          <PlayerVolumeContainer 
            onMouseEnter={() => setPlayerState({ ...playerState, isVolumeHovered: true })}
            onMouseLeave={() => setPlayerState({ ...playerState, isVolumeHovered: false })}
            style={
              playerState.isVolumeHovered
                ? { alignSelf: 'flex-end', marginBottom: '4px' }
                : {}
            }
          >
            {playerState.isVolumeHovered && (
              <PlayerVolumeSliderContainer>
                <PlayerVolumeSlider
                  type={'range'}
                  min={0}
                  max={1}
                  step={0.01}
                  value={playerState.volume}
                  onChange={(e) => setPlayerState({...playerState, volume: Number(e.target.value)})}
                />
              </PlayerVolumeSliderContainer>
            )}
            <PlayerIcon
              icon={playerState.isMuted || playerState.volume === 0 ? faVolumeMute : faVolumeUp}
              onClick={toggleMuted}
              fixedWidth
            />
          </PlayerVolumeContainer>
          <PlayerBar onClick={handleClickSeek}>
            {playerState.buffer.map(({ start, end }, index) => (
              <PlayerBarBuffer key={index} style={{ left: `${start / playerState.duration * 100}%`, width: `${((end - start) / playerState.duration) * 100}%` }} />
            ))}
            <PlayerBarProgress style={{
              width: `${sanitizeTime((playerState.visualProgress / playerState.duration) * 100)}%`
            }}>
              <PlayerBarPlayHead
                draggable
                onDragStart={pause}
                onDrag={handleDragSeek}
                onDragEnd={() => {
                  seek(playerState.dragState.value[0])
                  setPlayerState({ ...playerState, dragState: { ...playerState.dragState, value: [0, 0] } })
                  play()
                }}
              />
            </PlayerBarProgress>
          </PlayerBar>
          <PlayerTime>{`${getFormattedProgress()} / ${getTotalTime()}`}</PlayerTime>
          <PlayerIcon icon={playerState.isFullscreen ? faCompress : faExpand} onClick={toggleFullscreen} fixedWidth />
        </VideoOverlay>
      )}
    </VideoContainer>
  )
}

type FullscreenProps = { fullscreen: boolean }

const PlayerTime = styled.span`
  flex-shrink: 0;
  color: white;
  font-size: 14px;
  user-select: none;
`

const PlayerBarPlayHead = styled.div`
  position: absolute;
  display: none;
  width: 10px;
  height: 10px;
  margin-top: -2px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.5);
  right: -5px;
  cursor: pointer;

  &:hover {
    display: block;
  }
`

const PlayerBarProgress = styled.div`
  position: relative;
  height: 6px;
  background-color: #aaa;
  border-radius: 6px;
`

const PlayerBarBuffer = styled.div`
  position: absolute;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
`

const PlayerBar = styled.div`
  flex: 1;
  position: relative;
  width: 60%;
  height: 6px;
  background-color: #555;
  border-radius: 6px;

  &:hover {
    ${PlayerBarPlayHead} {
      display: block;
    }
    ${PlayerBarProgress} {
      background-color: #fff;
    }
  }
`
const PlayerVolumeSlider = styled.input<{ value: number }>`
  appearance: none;
  width: 64px;
  height: 6px;
  transform: rotate(-90deg);
  outline: none;
  background-color: #aaa;
  background-image: linear-gradient(to right, #aaa, #aaa ${props => props.value * 100}%, #555 ${props => props.value * 100}%, #555);
  border-radius: 999px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    background-color: #aaa;
    border-radius: 50%;
    box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.5);
  }

  &::-moz-range-thumb {
    width: 10px;
    height: 10px;
    background-color: #aaa;
    border-radius: 50%;
  }

  &::-ms-thumb {
    width: 10px;
    height: 10px;
    background-color: #aaa;
    border-radius: 50%;
  }

  &:hover {
    background-image: linear-gradient(to right, #fff, #fff ${props => props.value * 100}%, #555 ${props => props.value * 100}%, #555);

    &::-webkit-slider-thumb {
      background-color: #fff;
    }

    &::-moz-range-thumb {
      background-color: #fff;
    }

    &::-ms-thumb {
      background-color: #fff;
    }
  }
`

const PlayerVolumeSliderContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 13px;
  height: 72px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  margin-bottom: 4px;
`

const PlayerVolumeContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
`

const PlayerIcon = styled(FontAwesomeIcon)`
  flex-shrink: 0;
  font-size: 24px;
  cursor: pointer;

  &:hover {
    color: white;
  }
`

const VideoOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 32px;
  padding: 0 4px;
  margin-top: -32px;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  gap: 8px;
  color: #aaa;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
  z-index: 1;

  & > * {
    line-height: 32px;
  }
`

const VideoTitle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 32px;
  padding: 0 8px;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
  color: white;
  font-size: 16px;
  text-align: left;
  line-height: 32px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  z-index: 1;
`

const Video = styled.video`
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`

const VideoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`

const VideoContainer = styled.div<FullscreenProps & { hoverTransition: boolean }>`
  position: relative;
  min-width: 64px;
  min-height: 64px;
  width: ${({fullscreen}) => fullscreen ? '100%' : 'fit-content'};
  height: ${({fullscreen}) => fullscreen ? '100%' : 'fit-content'};
  background-color: #000;
  border-radius: ${({fullscreen}) => fullscreen ? '0' : '8px'};
  overflow: hidden;

  ${VideoOverlay},
  ${VideoTitle} {
    animation: ${({ hoverTransition }) => hoverTransition ? 'fadeOut' : 'fadeIn'} 200ms ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`

export default VideoPlayer
