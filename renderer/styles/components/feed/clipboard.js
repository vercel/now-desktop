import css from 'styled-jsx/css';

export default css`
  aside {
    display: flex;
    width: 100%;
    height: 60px;
    background: #000000;
    color: #ffffff;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
    transition: background 0.2s, color 0.2s ease-out;
  }

  aside:hover {
    background: #ffffff;
    color: #000000;
  }

  p {
    margin: 10px 10px;
    font-size: 13px;
  }
`;
