import styled from 'styled-components'
import { Container } from '../styled'

import Error from './error'

const NavigationContainer = styled(Container)`
  @media only screen and (max-width: 800px) {
    justify-content: center;
  }
`
const Navigation = ({ info }) => {
  const { errors, lastError } = info

  return (
    <NavigationContainer>
      <Error errorCount={errors} lastError={lastError} />
    </NavigationContainer>
  )
}

export default Navigation