import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  gap: 2rem;
  margin: 5vh 10vw;
  flex-wrap: wrap;

  @media only screen and (max-width: 800px) {
    margin: 1vh 1vw;
  }
`

export const ItemsContainer = styled.div`
  flex-basis: 40rem;
  outline: red;
  flex-grow: 1;
`

export const ActiveContainer = styled.div`
  min-height: 23rem;
  background: var(--box-gradient);
  border-radius: .5rem;
  padding: 1rem 2rem;

  h1 {
    margin-left: .5rem;
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
`

export const ActiveTransfer = styled.div`
  border-radius: .3rem;
  border: 1px solid var(--secondary-color);
  background-color: var(--secondary-color-trans);
  padding: .5rem;
  margin: .5rem 0 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 0 1rem;
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
`

export const InfosContainer = styled.div`
  
`

export const InfosWrapper = styled.div`
  border-radius: .3rem;
  /* border: 1px solid black; */
  background: var(--box-gradient);
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: .5rem .8rem;
  gap: .2rem 2rem;
  margin: 1rem 0;

  h2 {
    grid-column: 1 / span 2;
  }

  &:first-child {
    margin: 0;
  }
`

export const Button = styled.div`
  padding: .5rem 1rem;
  text-align: center;
  background-color: #eee;
  border-radius: .2rem;
  transition: background-color .3s;
  cursor: pointer;

  :hover {
    background-color: #ddd;
  }
`

export const StopButton = styled(Button)`
  position: absolute;
  right: 1rem;
  top: 1.1rem;
`

export const PopupContainer = styled.div`
  position: fixed;
  top: 3vh;
  width: 80vw;
  left: 10vw;
  height: 94vh;
  background-color: #dddddd;
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
  }

  @media only screen and (max-width: 800px) {
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
  }
`

export const PopupTitle = styled.p`
  font-size: 2rem;
  text-align: center;
  font-weight: 600;
  background-color: #cccccc;
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