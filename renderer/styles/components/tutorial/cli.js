import css from 'styled-jsx/css'

export default css`
  p {
    font-size: 14px;
    margin: 0;
    line-height: 24px;
    max-width: 420px;
    text-align: center;
    cursor: default;
  }

  p.has-tiny-spacing {
    margin-top: 55px;
  }

  code {
    border-radius: 3px;
    font-weight: 600;
    color: #d761e7;
  }

  .black-checkbox[type='checkbox']:not(:checked),
  .black-checkbox[type='checkbox']:checked {
    position: absolute;
    left: -9999px;
  }
  .black-checkbox[type='checkbox']:not(:checked) + label,
  .black-checkbox[type='checkbox']:checked + label {
    position: relative;
    padding-left: 1.8em;
    cursor: pointer;
  }

  .black-checkbox[type='checkbox']:not(:checked) + label:before,
  .black-checkbox[type='checkbox']:checked + label:before {
    content: '';
    box-shadow: none;
    border-color: #bbb;
    position: absolute;
    left: 0;
    top: 0;
    width: 1.25em;
    height: 1.25em;
    background: #000;
    border-radius: 4px;
  }

  .black-checkbox[type='checkbox']:not(:checked) + label:after,
  .black-checkbox[type='checkbox']:checked + label:after {
    content: '✔';
    position: absolute;
    top: 0.1em;
    left: 0.13em;
    font-size: 1.1em;
    line-height: 1;
    background: #000;
    color: #fff;
    transition: all 0.2s;
  }

  .black-checkbox[type='checkbox']:not(:checked) + label:after {
    opacity: 0;
    transform: scale(0);
  }
  .black-checkbox[type='checkbox']:checked + label:after {
    opacity: 1;
    transform: scale(1);
  }

  .permission {
    color: #999999;
    font-size: 12px;
  }
`
