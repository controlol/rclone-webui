import styled from 'styled-components'

export const Input = styled.input`
  width: 100%;
  padding: .6em 1em;
  margin: .5em 0;
  display: inline-block;
  border-radius: 4px;
  border: 1px solid var(--primary-color);
  background-color: var(--background-color);
  color: white;
  transition: border .3s ease-in-out;
  font-size: .9rem;

  &:focus {
    outline: none;
    background-color: #282828;
  }
`

export const Label = styled.label`
  margin-right: .7vw;
`

export const FileBrowsersContainer = styled.div`
  display: flex;
  gap: 0 1rem;
  height: calc(94vh - 9rem);

  @media only screen and (max-width: 800px) {
    height: calc(100vh - 9rem);
  }
`

export const FileBrowserWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: .5rem 0;
  width: 100%;
  height: inherit;
`

export const FileBrowserRemotes = styled.div`
  display: flex;
  gap: .5rem;
  justify-content: flex-start;
`