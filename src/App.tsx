import React from 'react';
import styled from 'styled-components';
import './App.css';
import VideoPlayer from './VideoPlayer';

function App() {
  return (
    <Container>
      <VideoPlayer src="https://rr5---sn-5goeen7d.googlevideo.com/videoplayback?expire=1661679029&ei=VeEKY9LaIMW_W4mot3g&ip=45.192.136.130&id=o-AHCMCphiXpx9-7tbsAh5MCnHUO4viipfIJSA_IWcNtT-&itag=18&source=youtube&requiressl=yes&mh=nP&mm=31%2C26&mn=sn-5goeen7d%2Csn-5hnekn7l&ms=au%2Conr&mv=m&mvi=5&pl=24&initcwndbps=2127500&vprv=1&mime=video%2Fmp4&ns=FAS3XYasK0LJNYJpRDz1FHEH&gir=yes&clen=4582761&ratebypass=yes&dur=105.395&lmt=1582373649132957&mt=1661657111&fvip=4&fexp=24001373%2C24007246&c=WEB&rbqsm=fr&txp=5531432&n=U9iEVZLXEgAU9DkBBZA8U&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhALzhhHYlbc7yB_0IAVldCRIrvHGipwyt2u0b1KrIH1NrAiBCWLWVlWt3WZQCDDU-wWbwv5ZlK0AMWRnI-5066LaxEQ%3D%3D&sig=AOq0QJ8wRQIhAM9wpCgmFczlbMUbAC5AQcbtUuYuTp94rGVQSFRHOa61AiAvSlJuFBQZ72IweAQ8t1ynD60qYVcMS8_30C8aY0VJQg==" />
    </Container>
  );
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default App;
