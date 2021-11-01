import styled from 'styled-components'
import ReactTooltip from 'react-tooltip'

import CheckCircle from '../assets/icons/check-circle.svg'
import ErrorCircle from '../assets/icons/error-circle.svg'

export const ErrorContainer = styled.div`
  background-color: var(--button-color);
  border-radius: .4rem;
  padding: .5rem .75rem;
  display: flex;
  align-items: center;
  gap: 0 .5rem;
  cursor: default;
`

const Error = ({ errorCount, lastError }) => {
  const errorCountString = (errorCount ? errorCount : 0) + ( errorCount === 1 ? " Error" : " Errors" )

  const imageSource = errorCount > 0 ? ErrorCircle : CheckCircle

  const ErrorToolTipString = errorCount > 0 ? `${errorCountString} since Rclone started<br/>Last error: ${lastError}` : "0 errors since Rclone started"

  return (
    <ErrorContainer data-tip={ErrorToolTipString} data-for="error-cnt" >
      <img src={imageSource} alt="Error Icon" height="20" width="20" />
      { errorCountString }
      <ReactTooltip id="error-cnt" type="info" effect="solid" offset={{ top: -7 }} multiline={true} />
    </ErrorContainer>
  )
}

export default Error