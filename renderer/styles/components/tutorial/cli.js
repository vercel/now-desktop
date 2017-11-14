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

  .cli-wrapper {
    position: absolute;
    bottom: 0;
  }

  .black-checkbox[type='checkbox']:not(:checked),
  .black-checkbox[type='checkbox']:checked {
    position: absolute;
    opacity: 0;
  }

  .black-checkbox[type='checkbox']:checked {
    color: red;
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
    top: 3px;
    left: 0;
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 3px;
    box-sizing: border-box;
    border: 1px solid #979797;
  }

  .black-checkbox[type='checkbox']:not(:checked) + label:after,
  .black-checkbox[type='checkbox']:checked + label:after {
    content: '✓';
    position: absolute;
    font-size: 17px;
    color: #fff;
    line-height: 10px;
    top: 3px;
    left: 0;
    width: 12px;
    height: 12px;
    background: #000;
    border-radius: 3px;
    padding-left: 1px;
    box-sizing: border-box;
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
