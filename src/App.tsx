import styled from 'styled-components';
import './App.css';
import VideoPlayer from './components/VideoPlayer';

function App() {
  return (
    <Container>
      <VideoPlayer title={'Caravan Palace - Chill with Caravan Palace (One Hour Mix)'} src="https://dd28.vnaydjzfazd.xyz/download?file=MDIyNzAxZmEyMTFhODVjNGViYThlNjBiMTVhODUyZjAxNzZlMTAyZGY3ZWRiYWQ5YTQ4ODEwNTNmZTZlNjlmN18xMDgwcC5tcDTimK9TbmFwU2F2ZS5pby1DYXJhdmFuIFBhbGFjZSAtIENoaWxsIHdpdGggQ2FyYXZhbiBQYWxhY2UgKE9uZSBIb3VyIE1peCnimK8xMDgwcA" />
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
