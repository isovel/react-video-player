import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import styled from 'styled-components';
import './App.css';
import VideoPlayer from './components/VideoPlayer';

function App() {
  const [videoTitle, setVideoTitle] = useState('Caravan Palace - Chill with Caravan Palace (One Hour Mix)');
  const [videoVolume, setVideoVolume] = useState(50);
  const [videoThumbnail, setVideoThumbnail] = useState('https://i.ytimg.com/vi/FBn7QPQaVPo/maxresdefault.jpg');
  const [videoUrlInput, setVideoUrlInput] = useState('https://redirector.googlevideo.com/videoplayback?expire=1662287555&ei=YyoUY8_ZA5TlgQewpY3gAw&ip=195.201.109.29&id=o-AAVD31bl2xrEOd0slQ8l8tj32LTzk-5Qf7o0QfGOu2j2&itag=22&source=youtube&requiressl=yes&mh=99&mm=31%2C26&mn=sn-4g5lznle%2Csn-f5f7lnl6&ms=au%2Conr&mv=m&mvi=3&pl=25&initcwndbps=347500&vprv=1&svpuc=1&mime=video%2Fmp4&cnr=14&ratebypass=yes&dur=3732.491&lmt=1593988991689069&mt=1662265520&fvip=2&fexp=24001373%2C24007246&c=ANDROID&rbqsm=fr&txp=5535432&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Csvpuc%2Cmime%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRAIgAVbeXjeRUP0YDJ_aVWJhR2XaDFwdy3cPFABEADFXmjoCIE_-qlroOfZS2t6E01D_iAbHikDkfKCzqbVY5VcqSKIJ&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAIzK1rrSlGotTBBufML83WNNC6UqAnGKzNwtat7KdXpBAiBApXb5CF4JXjc5tA5QOCeJp13FnQZBRP11-RXEF2PcMw%3D%3D&host=rr3---sn-4g5lznle.googlevideo.com&title=SnapSave.io-Caravan%20Palace%20-%20Chill%20with%20Caravan%20Palace%20(One%20Hour%20Mix)');
  const [videoUrl, setVideoUrl] = useState(videoUrlInput);

  return (
    <Container>
      <OptionsContainer>
        <OptionInput
          type='text'
          placeholder='Enter a video title'
          label='Title'
          value={videoTitle}
          onChange={(e: any) => setVideoTitle(e.target.value)}
        />
        <OptionInput
          type='number'
          placeholder='Vol'
          min={0}
          max={100}
          maxlength={3}
          step={1}
          label='Vol'
          value={videoVolume}
          onChange={(e: any) => setVideoVolume(e.target.value)}
          size={64}
        />
        <OptionInput
          type='text'
          placeholder='Enter a video thumbnail url'
          label='Thumb URL'
          value={videoThumbnail}
          onChange={(e: any) => setVideoThumbnail(e.target.value)}
          style={{
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
          }}
        />
        <OptionInput
          type='text'
          placeholder='Enter a video URL'
          label='URL'
          value={videoUrlInput}
          onChange={(e: any) => setVideoUrlInput(e.target.value)}
          style={{
            borderRight: 'none',
            borderRadius: '0',
            marginLeft: 0,
          }}
        />
        <OptionButton
          onClick={() => setVideoUrl(videoUrlInput)}
          style={{
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
          }}
        >
          <FontAwesomeIcon icon={faAngleRight} fixedWidth />
        </OptionButton>
      </OptionsContainer>
      <VideoPlayer
        title={videoTitle}
        thumbnail={videoThumbnail}
        volume={videoVolume / 100}
        source={[{ src: videoUrl }]}
        playbackRate={2}
      />
    </Container>
  );
}

const OptionButton = styled.button`
  appearance: none;
  outline: none;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 8px;

  &:focus {
    border: 1px solid #555 !important;
  }
`

const OptionInput = (props: any) => {
  const [focused, setFocused] = useState(false)

  const handleFocus = (focus: boolean) => setFocused(focus)

  return (
    <OptionInuptContainer>
      <OptionInputLabel style={ focused ? { color: '#555' } : {}}>
        {props.label}
      </OptionInputLabel>
      <OptionInputInput {...props} onFocus={() => handleFocus(true)} onBlur={() => handleFocus(false)} />
    </OptionInuptContainer>
  )
}

const OptionInputLabel = styled.span`
  position: absolute;
  top: -7px;
  left: 16px;
  display: block;
  font-size: 12px;
  color: #999;
  background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, #fff 8%, #fff 92%, rgba(255, 255, 255, 0) 100%);
  padding: 0 3px;
  transition: all 100ms ease-in-out;
`

const OptionInputInput = styled.input<{ label: string, size?: number }>`
  appearance: none;
  outline: none;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-left: 8px;
  width: ${({ size }) => size ? size : 256}px;
  transition: all 100ms ease-in-out;

  &:focus {
    border: 1px solid #555 !important;
  }
`;

const OptionInuptContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
`

export default App;
