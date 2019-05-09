import React, { useState } from 'react';
import PropTypes from 'prop-types';

const CHECKBOX_SVG_LIGHT = {
  normal:
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.5 0.5H3.5C1.84315 0.5 0.5 1.84315 0.5 3.5V8.5C0.5 10.1569 1.84315 11.5 3.5 11.5H8.5C10.1569 11.5 11.5 10.1569 11.5 8.5V3.5C11.5 1.84315 10.1569 0.5 8.5 0.5Z' stroke='%23999'/%3E%3C/svg%3E%0A",
  hover:
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.5 0.5H3.5C1.84315 0.5 0.5 1.84315 0.5 3.5V8.5C0.5 10.1569 1.84315 11.5 3.5 11.5H8.5C10.1569 11.5 11.5 10.1569 11.5 8.5V3.5C11.5 1.84315 10.1569 0.5 8.5 0.5Z' stroke='black'/%3E%3C/svg%3E%0A",
  disabled:
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.5 0.5H3.5C1.84315 0.5 0.5 1.84315 0.5 3.5V8.5C0.5 10.1569 1.84315 11.5 3.5 11.5H8.5C10.1569 11.5 11.5 10.1569 11.5 8.5V3.5C11.5 1.84315 10.1569 0.5 8.5 0.5Z' fill='%23EFEFEF' stroke='%23999'/%3E%3C/svg%3E",
  checkedNormal:
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0' mask-type='alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='12' height='12'%3E%3Cpath d='M9 0H3C1.34315 0 0 1.34315 0 3V9C0 10.6569 1.34315 12 3 12H9C10.6569 12 12 10.6569 12 9V3C12 1.34315 10.6569 0 9 0Z' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0)'%3E%3Cpath d='M9 0H3C1.34315 0 0 1.34315 0 3V9C0 10.6569 1.34315 12 3 12H9C10.6569 12 12 10.6569 12 9V3C12 1.34315 10.6569 0 9 0Z' fill='black'/%3E%3Cpath d='M3.53906 4.79101L6.68945 7.88867L15.1213 -0.543182' stroke='white' stroke-width='1.5'/%3E%3C/g%3E%3C/svg%3E",
  checkedDisabled:
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0' mask-type='alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='12' height='12'%3E%3Cpath d='M9 0H3C1.34315 0 0 1.34315 0 3V9C0 10.6569 1.34315 12 3 12H9C10.6569 12 12 10.6569 12 9V3C12 1.34315 10.6569 0 9 0Z' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0)'%3E%3Cpath d='M9 0H3C1.34315 0 0 1.34315 0 3V9C0 10.6569 1.34315 12 3 12H9C10.6569 12 12 10.6569 12 9V3C12 1.34315 10.6569 0 9 0Z' fill='%23999999'/%3E%3Cpath d='M3.53906 4.79101L6.68945 7.88867L15.1213 -0.543182' stroke='white' stroke-width='1.5'/%3E%3C/g%3E%3C/svg%3E"
};

const CHECKBOX_SVG_DARK = {
  normal: CHECKBOX_SVG_LIGHT.normal,
  hover:
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.5 0.5H3.5C1.84315 0.5 0.5 1.84315 0.5 3.5V8.5C0.5 10.1569 1.84315 11.5 3.5 11.5H8.5C10.1569 11.5 11.5 10.1569 11.5 8.5V3.5C11.5 1.84315 10.1569 0.5 8.5 0.5Z' stroke='white'/%3E%3C/svg%3E",
  disabled:
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.5 0.5H3.5C1.84315 0.5 0.5 1.84315 0.5 3.5V8.5C0.5 10.1569 1.84315 11.5 3.5 11.5H8.5C10.1569 11.5 11.5 10.1569 11.5 8.5V3.5C11.5 1.84315 10.1569 0.5 8.5 0.5Z' fill='%23333' stroke='%23999'/%3E%3C/svg%3E",
  checkedNormal:
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0' mask-type='alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='12' height='12'%3E%3Cpath d='M9 0H3C1.34315 0 0 1.34315 0 3V9C0 10.6569 1.34315 12 3 12H9C10.6569 12 12 10.6569 12 9V3C12 1.34315 10.6569 0 9 0Z' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0)'%3E%3Cpath d='M9 0H3C1.34315 0 0 1.34315 0 3V9C0 10.6569 1.34315 12 3 12H9C10.6569 12 12 10.6569 12 9V3C12 1.34315 10.6569 0 9 0Z' fill='white'/%3E%3Cpath d='M3.53906 4.79101L6.68945 7.88867L15.1213 -0.543182' stroke='black' stroke-width='1.5'/%3E%3C/g%3E%3C/svg%3E",
  checkedDisabled:
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0' mask-type='alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='12' height='12'%3E%3Cpath d='M9 0H3C1.34315 0 0 1.34315 0 3V9C0 10.6569 1.34315 12 3 12H9C10.6569 12 12 10.6569 12 9V3C12 1.34315 10.6569 0 9 0Z' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0)'%3E%3Cpath d='M9 0H3C1.34315 0 0 1.34315 0 3V9C0 10.6569 1.34315 12 3 12H9C10.6569 12 12 10.6569 12 9V3C12 1.34315 10.6569 0 9 0Z' fill='%23999999'/%3E%3Cpath d='M3.53906 4.79101L6.68945 7.88867L15.1213 -0.543182' stroke='black' stroke-width='1.5'/%3E%3C/g%3E%3C/svg%3E"
};

const Checkbox = ({
  disabled,
  checked: checked_,
  darkMode,
  onChange,
  className,
  name,
  label,
  ...props
}) => {
  const [checked, setChecked] = useState(checked_);

  const SVG = darkMode ? CHECKBOX_SVG_DARK : CHECKBOX_SVG_LIGHT;

  function handleToggle(event) {
    if (!disabled) {
      setChecked(!checked);
      if (onChange) {
        onChange(event, !checked);
      }
    }
  }

  return (
    <span className={`checkbox ${disabled ? 'disabled' : ''}`} {...props}>
      <input
        checked={checked}
        disabled={disabled}
        name={name}
        title={name}
        aria-label={label}
        onChange={handleToggle}
        className={`checkbox-input ${className}`}
        type="checkbox"
      />
      <span className="checkmark" />
      <style jsx>
        {`
          input {
            cursor: pointer;
            opacity: 0;
          }
          .checkbox {
            display: inline-flex;
            position: relative;
          }

          .checkbox .checkmark {
            position: absolute;
            top: 2px;
            left: 2px;
            cursor: pointer;
            display: inline-block;
            height: 12px;
            width: 12px;
            outline: 0;
            background: url("${SVG.normal}");
            pointer-events: none;
          }

          .checkbox.disabled .checkmark,
          .checkbox.disabled input {
            background: url("${SVG.disabled}");
            cursor: not-allowed;
          }

          .checkbox .checkmark:hover {
            background: url("${SVG.hover}");
          }

          .checkbox input:checked + .checkmark {
            background: url("${SVG.checkedNormal}");
          }

          .checkbox.disabled input:checked + .checkmark {
            background: url("${SVG.checkedDisabled}");
          }
        `}
      </style>
    </span>
  );
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  darkMode: PropTypes.boolean
};

Checkbox.defaultProps = {
  checked: false,
  disabled: false,
  name: '',
  onChange: null
};

export default Checkbox;
