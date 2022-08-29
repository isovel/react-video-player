import { faCompress, faExpand, faPause, faPlay, faVolumeMute, faVolumeUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { SyntheticEvent, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { VideoPlayerProps } from "../types/VideoPlayer"

// Format time in seconds to a string in the format of mm:ss or hh:mm:ss if the time is greater than an hour
const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time - (hours * 3600)) / 60)
  const seconds = Math.floor(time - (hours * 3600) - (minutes * 60))

  return `${hours > 0 ? `${hours}:` : ""}${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}

const sanitizeTime = (time: number) => {
  return isNaN(time) ? 0 : time < 0 ? 0 : time
}

const VideoPlayer = (props: VideoPlayerProps) => {
  const videoElement = useRef<HTMLVideoElement>(null)
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    isMuted: false,
    isFullscreen: false,
    isHovered: false,
    shouldTransitionHover: false,
    progress: 0,
    duration: 0,
    volume: 0.5,
    isVolumeHovered: false,
    dragState: [0, 0]
  })

  const getFormattedProgress = () => formatTime(playerState.progress)
  const getTotalTime = () => formatTime(playerState.duration)

  useEffect(() => {
    playerState.isPlaying
      ? videoElement.current!.play()
      : videoElement.current!.pause()
  }, [playerState.isPlaying, videoElement])

  useEffect(() => {
    playerState.isMuted
      ? (videoElement.current!.muted = true)
      : (videoElement.current!.muted = false)
  }, [playerState.isMuted, videoElement])

  useEffect(() => {
    videoElement.current!.volume = playerState.volume
  }, [playerState.volume, videoElement])

  useEffect(() => {
    playerState.isFullscreen
      ? videoElement.current!.parentElement!.parentElement!.requestFullscreen()
      : document.fullscreenElement && document.exitFullscreen()
  }, [playerState.isFullscreen])

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

  const seek = (time: number) => {
    time = time < 0 ? 0 : time
    time = time > playerState.duration ? playerState.duration : time
    videoElement.current!.currentTime = Number(time)
  }

  // hnadle dragging the progress bar to seek the video relative to the duration and the parent container
  const handleSeek = (e: SyntheticEvent<HTMLDivElement, DragEvent>) => {
    const { clientX } = e.nativeEvent
    const { left, width } = e.currentTarget.getBoundingClientRect()
    const progress = (clientX - left) / width
    seek(progress)
    setPlayerState({
      ...playerState,
      dragState: [playerState.dragState[1], progress]
    })
  }

  const handleOnTimeUpdate = (e: SyntheticEvent<HTMLVideoElement>) => {
    setPlayerState({
      ...playerState,
      progress: sanitizeTime(e.currentTarget.currentTime),
      duration: sanitizeTime(e.currentTarget.duration),
    })
  }

  const handleEnded = (e: SyntheticEvent<HTMLVideoElement>) => {
    setPlayerState({
      ...playerState,
      isPlaying: false,
    })
  }

  const toggleFullscreen = () => {
    setPlayerState({
      ...playerState,
      isFullscreen: !playerState.isFullscreen,
    })
  }

  const shouldShowOverlays = !playerState.isPlaying || playerState.isHovered || playerState.shouldTransitionHover

  return (
    <VideoContainer
    id={'test'}
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
          src={props.src}
          onTimeUpdate={handleOnTimeUpdate}
          onEnded={handleEnded}
        />
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
          <PlayerBar>
            <PlayerBarProgress style={{
              width: `${sanitizeTime((playerState.progress / playerState.duration) * 100)}%`
            }}>
              <PlayerBarPlayHead draggable onDragStart={pause} onDrag={handleSeek} onDragEnd={() => {
                seek(playerState.dragState[0])
                setPlayerState({ ...playerState, dragState: [0, 0] })
                play()
              }} />
            </PlayerBarProgress>
          </PlayerBar>
          <PlayerTime>{getFormattedProgress()} / {getTotalTime()}</PlayerTime>
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

const PlayerBar = styled.div`
  flex: 1;
  position: relative;
  width: 60%;
  height: 6px;
  background-color: #555;
  border-radius: 6px;
  overflowX: hidden;

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
