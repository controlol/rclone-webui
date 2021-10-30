import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  gap: 0 2rem;
  margin: 1vh 10vw;
  flex-wrap: wrap;

  @media only screen and (max-width: 1280px) {
    margin: 0vh 1vw 1vh 1vw;
  }
`

export const HeaderContainer = styled(Container)`
  justify-content: space-between;

  @media only screen and (max-width: 800px) {
    flex-direction: column;
    margin-bottom: 2rem;
  }
`

export const ItemsContainer = styled.div`
  flex-basis: 39.6rem;
  flex-grow: 1;

  @media only screen and (max-width: 800px) {
    flex-basis: unset;
  }
`

export const LogoContainer = styled.div`
  border-radius: .5rem;
  padding: 1rem 2rem;
  min-height: 100px;

  display: flex;
  gap: .5rem;
  align-items: center;

  @media only screen and (max-width: 800px) {
    justify-content: center;
    padding: 0;
  }
  @media only screen and (max-width: 600px) {
    font-size: .8rem;
  }
`

export const ActiveContainer = styled.div`
  min-height: 23.5rem; // for perfect alignment with the info boxes
  background: var(--box-gradient);
  border-radius: .5rem;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: .5rem;

  h1 {
    margin-left: .5rem;
  }

  @media only screen and (max-width: 1280px) {
    min-height: unset;
  }
  @media only screen and (max-width: 800px) {
    padding: 1rem .5rem;

    h1 {
      margin-left: .3rem; // add .3 because InfosContainer has total of .8 padding
    }
  }
`

export const ActiveJob = styled.div`
  border-radius: .3rem;
  border: 1px solid var(--primary-color);
  background-color: var(--primary-color-trans);
  padding: .7rem;
  display: grid;
  grid-template-columns: auto auto auto auto 1fr;
  gap: .3rem 1.5rem;
  position: relative;

  p:nth-child(4n) {
    grid-column: 4 / span 2;
  }

  @media only screen and (max-width: 600px) {
    grid-template-columns: auto auto 1fr;

    p:nth-child(4n) {
      grid-column: unset;
    }

    p:nth-child(2n) {
      grid-column: 2 / span 2;
    }
  }
  @media only screen and (max-width: 450px) {
    padding-bottom: 3.5rem;
  }
`

export const ActiveTransfer = styled.div`
  border-radius: .3rem;
  border: 1px solid var(--secondary-color);
  background-color: var(--secondary-color-trans);
  padding: .5rem;
  margin-left: 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 0 1rem;

  p:first-child {
    overflow: hidden;
    direction: rtl;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media only screen and (max-width: 800px) {
    margin-left: 0;

    p:nth-child(1) {
      grid-column: 1 / span 4;
    }

    p:nth-child(2) {
      grid-column: 2;
    }
  }
`

export const HistoryContainer = styled(ActiveContainer)`
  margin-top: 1rem;
`

export const HistoryItemsWrapper = styled.div`
  overflow-y: auto;
  max-height: 25rem;

  ::-webkit-scrollbar {
    display: none;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`

export const HistoryItem = styled(ActiveTransfer)`
  grid-template-columns: 1fr auto;
  gap: .5rem 1.5rem;
  margin: 0.5rem 0 0 0;

  @media only screen and (max-width: 800px) {
    grid-template-columns: 1fr auto;
  }
`

export const InfosContainer = styled.div`
  
  @media only screen and (max-width: 1280px) {
    display: grid;
    margin-top: 1.5rem;
    gap: 1rem;
    grid-template-columns: 1fr 1fr 1fr;
    width: 100%;
  }

  @media only screen and (max-width: calc(1080px + 32px)) {
    grid-template-columns: 1fr 1fr;
  }
  @media only screen and (max-width: calc(720px + 16px)) {
    grid-template-columns: 1fr;
    margin-top: 1rem;
  }
  @media only screen and (max-width: 450px) {
    margin-bottom: 2rem;
  }
`

export const StatusContainer = styled.div`
  /* border-radius: .5rem;
  border-style: solid;
  border-width: 1px; */
  padding: .5rem .8rem;

  display: flex;
  align-items: center;
  gap: .5rem;
  width: 360px;

  @media only screen and (max-width: 1280px) {
    width: unset;
  }
  @media only screen and (max-width: 800px) {
    justify-content: center;
    padding: 0;
  }
`

export const StatusBulb = styled.div`
  height: 1.15rem;
  width: 1.15rem;
  border-radius: 1.15rem;
`

export const InfosWrapper = styled.div`
  border-radius: .3rem;
  /* border: 1px solid black; */
  background: var(--box-gradient);
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: .5rem .8rem .8rem .8rem;
  gap: .2rem 2rem;
  margin: 1rem 0;

  h2 {
    grid-column: 1 / span 2;
  }

  &:nth-child(1) {
    margin: 0;
  }

  @media only screen and (max-width: 1280px) {
    /* width: 100%; */
    margin: 0;
  }
`

export const Button = styled.div`
  padding: .5rem 1rem;
  text-align: center;
  background-color: var(--button-color);
  border-radius: .2rem;
  transition: background-color .3s;
  cursor: pointer;

  :hover {
    background-color: var(--button-hover);
  }
`

export const StopButton = styled(Button)`
  position: absolute;
  right: 1rem;
  top: 1.1rem;

  @media only screen and (max-width: 450px) {
    right: unset;
    top: unset;
    bottom: .8rem;
    left: .6rem;
  }
`

export const PopupContainer = styled.div`
  position: fixed;
  top: 3vh;
  width: 80vw;
  left: 10vw;
  height: 94vh;
  background-color: var(--popup-background);
  padding: 1rem 2rem;
  overflow-y: auto;
  z-index: 999;

  ::-webkit-scrollbar {
    display: none;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }

  pre {
    margin-top: 4.5rem;
    white-space: pre-wrap;
  }

  @media only screen and (max-width: 800px) {
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    padding: 1rem .5rem;
  }
`

export const PopupTitle = styled.p`
  font-size: 2rem;
  text-align: center;
  font-weight: 600;
  background-color: var(--popup-header);
  position: fixed;
  transform: translateX(-50%);
  left: 50%;
  width: 80vw;
  padding: 1rem 0;
  margin-top: -1rem;

  @media only screen and (max-width: 800px) {
    width: 100vw;
  }
`

export const Cross = styled.div`
  cursor: pointer;
  position: fixed;
  z-index: 20;
  right: 11.5vw;
  font-size: 1.25rem;

  @media only screen and (max-width: 800px) {
    right: 5vw;
  }
`

export const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`