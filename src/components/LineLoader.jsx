import styled, { keyframes } from 'styled-components'

const BarWidthAnimation = keyframes`
  0% {
    width: 40%;
  }
  100% {
    width: 25%;
  }
`

const BarPositionAnimation = keyframes`
  0% {
    left: -50%;
  }
  100% {
    left: 100%;
  }
`

const LoaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  background-color: rgba(255,255,255,.1);
  overflow: hidden;

  ::before, ::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
    width: 100%;
    background-color: var(--primary-color);
  }

  ::after {
    background-color: var(--secondary-color);
    animation: ${BarWidthAnimation} 8s, ${BarPositionAnimation} 3s;
  }
`

const LineLoader = props => {
  return <LoaderContainer />
}

export default LineLoader