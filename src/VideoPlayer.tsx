import { faPause, faPlay, faVolumeMute, faVolumeUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { SyntheticEvent, useEffect, useRef, useState } from "react"
import styled from "styled-components"

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}

const VideoPlayer = (props: { src: string }) => {
  const videoElement = useRef<HTMLVideoElement>(null)
  const hasPlayed = useRef(false)
  const [playerState, setPlayerState] = useState({
    hasPlayed: false,
    isPlaying: false,
    isMuted: false,
    progress: 0,
    duration: 0,
    volume: 1,
  })
  const [dragState, setDragState] = useState([0, 0])

  const getFormattedProgress = () => formatTime(playerState.progress)
  const getTotalTime = () => formatTime(playerState.duration)

  useEffect(() => {
    playerState.isPlaying
      ? videoElement.current!.play()
      : videoElement.current!.pause();
  }, [playerState.isPlaying, videoElement]);

  useEffect(() => {
    playerState.isMuted
      ? (videoElement.current!.muted = true)
      : (videoElement.current!.muted = false);
  }, [playerState.isMuted, videoElement]);

  useEffect(() => {
    videoElement.current!.volume = playerState.volume;
  }, [playerState.volume, videoElement]);

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
    time = time < 0 ? 0 : time;
    time = time > playerState.duration ? playerState.duration : time;
    videoElement.current!.currentTime = Number.parseInt(time.toFixed(3));
  }

  // hnadle dragging the progress bar to seek the video relative to the duration and the parent container
  const handleSeek = (e: SyntheticEvent<HTMLDivElement, DragEvent>) => {
    const { clientX } = e.nativeEvent;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const progress = (clientX - left) / width;
    seek(progress);
    setDragState([dragState[1], progress]);
  }

  const handleOnTimeUpdate = (e: SyntheticEvent<HTMLVideoElement>) => {
    setPlayerState({
      ...playerState,
      progress: e.currentTarget.currentTime,
      duration: e.currentTarget.duration,
    })
    hasPlayed.current = true
  }

  const handleEnded = (e: SyntheticEvent<HTMLVideoElement>) => {
    setPlayerState({
      ...playerState,
      isPlaying: false,
    })
  }

  return (
    <VideoContainer>
      <Video ref={videoElement} src={props.src} onTimeUpdate={handleOnTimeUpdate} onEnded={handleEnded} />
      <VideoOverlay>
      <PlayerIcon icon={playerState.isPlaying ? faPause : faPlay} onClick={togglePlaying} fixedWidth />
      <PlayerIcon icon={playerState.isMuted ? faVolumeMute : faVolumeUp} onClick={toggleMuted} fixedWidth />
      <PlayerBar>
        <PlayerBarProgress style={{
          backgroundColor: "white",
          width: `${(playerState.progress / playerState.duration) * 100}%`
        }}>
          <PlayerBarPlayHead draggable onDragStart={pause} onDrag={handleSeek} onDragEnd={() => {
            seek(dragState[0])
            setDragState([0, 0])
            play()
          }} />
        </PlayerBarProgress>
      </PlayerBar>
      <PlayerTime>{getFormattedProgress()} / {getTotalTime()}</PlayerTime>
      </VideoOverlay>
    </VideoContainer>
  )
}

const VideoContainer = styled.div`
  position: relative;
  min-width: 64px;
  min-height: 64px;
  width: fit-content;
  height: fit-content;
`

const Video = styled.video`
  border-radius: 8px;
  display: block;
  z-index: 0;
`

const VideoOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 32px;
  padding: 0 8px;
  margin-top: -32px;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  gap: 8px;
  color: #aaa;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 8px 8px;
  z-index: 1;

  & > * {
    line-height: 32px;
  }
`

const PlayerIcon = styled(FontAwesomeIcon)`
  flex-shrink: 0;
  font-size: 24px;
  cursor: pointer;

  &:hover {
    color: white;
  }
`

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

const PlayerBar = styled.div`
  flex: 1;
  position: relative;
  width: 60%;
  height: 6px;
  background-color: #aaa;
  border-radius: 6px;
  overflowX: hidden;

  &:hover {
    ${PlayerBarPlayHead} {
      display: block;
    }
  }
`

const PlayerBarProgress = styled.div`
  position: relative;
  height: 6px;
  border-radius: 6px;
`

export default VideoPlayer
