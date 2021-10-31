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