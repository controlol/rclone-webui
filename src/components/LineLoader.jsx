import styled, { keyframes } from 'styled-components'

const BarWidthAnimation = keyframes`
  0% {
    width: 70%;
  }
  100% {
    width: 30%;
  }
`

const BarPositionAnimation = keyframes`
  0% {
    left: -35%;
  }
  100% {
    left: 135%;
  }
`

const LoaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
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
    transform: translateX(-50%);
    animation: ${BarWidthAnimation} 2s infinite alternate, ${BarPositionAnimation} 2s infinite;
  }
`

const LineLoader = props => {
  return <LoaderContainer />
}

export default LineLoader