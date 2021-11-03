import styled from 'styled-components'
import { Button } from '../styled'

export const Label = styled.label`
  margin-right: .7vw;
`

export const FileBrowsersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: .5rem 0;
  height: calc(94vh - 9rem);
  
  @media only screen and (max-width: 800px) {
    height: calc(100vh - 9rem);
  }
  `

export const FileBrowserWrapper = styled.div`
  display: flex;
  gap: 0 1rem;
  width: 100%;
  height: inherit;
`

export const FileBrowserRemotes = styled.div`
  display: flex;
  gap: .5rem;
  justify-content: flex-start;
  flex-wrap: wrap;
`

export const FileBrowserSettings = styled.div`
  display: flex;
  gap: .5rem;
  flex-grow: 1;
  justify-content: flex-end;
  max-width: 100%;
`

export const BrowserSettingButton = styled(Button)`
  padding: .25rem .45rem;
  display: flex;
  align-items: center;
`

export const FileSettingsPopup = styled.div`
  min-width: 15rem;
  background-color: var(--button-color);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 900;
  padding: 1rem;
  border-radius: .3rem;
  box-shadow: 0 0 .5rem rgba(0,0,0,.3);
`

export const FileSettingsHeader = styled.h3`
  text-align: center;
  margin-bottom: 1rem;
`

export const FileColumnSettingsContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: .5rem 0;
`

export const RemoteButton = styled(Button)`
  max-width: calc(100% - 2rem);
  overflow: hidden;
  direction: rtl;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: ${({active}) => active ? "var(--button-hover)" : "var(--button-color)"}
`