import css from 'styled-jsx/css';

export default css`
  span {
    height: 12px;
    flex-shrink: 0;
    display: block;
  }

  span:not([style]) {
    display: flex;
    justify-content: center;
  }
`;
