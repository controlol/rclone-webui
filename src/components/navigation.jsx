import styled from 'styled-components'
import { Button as normalButton, Container } from '../styled'

import Error from './error'
import BrowserSingle from '../assets/icons/browserSingle.svg'

const NavigationContainer = styled(Container)`
  gap: 0 .5rem;

  @media only screen and (max-width: 800px) {
    justify-content: center;
  }
`

const Button = styled(normalButton)`
  display: flex;
  align-items: center;
  gap: 0 .3rem;
`

const Navigation = ({ info, openBrowser }) => {
  const { errors, lastError } = info

  return (
    <NavigationContainer>
      <Error errorCount={errors} lastError={lastError} />
      <Button onClick={openBrowser}>
        <img src={BrowserSingle} alt="file browser" width="18" height="18" />
        File Browser
      </Button>
    </NavigationContainer>
  )
}

export default Navigation