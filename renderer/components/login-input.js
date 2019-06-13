import { useState } from 'react';
import PropTypes from 'prop-types';
import LoginArrow from '../vectors/login-arrow';
import emailProviders from '../utils/email-providers';

export const EMAIL_RX = /[A-Z0-9a-z._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,64}/;

const LoginInput = ({
  onChange,
  value = '',
  darkMode,
  onSubmit,
  disabled,
  error
}) => {
  const [suggestion, setSuggestion] = useState('');
  const [focused, setFocused] = useState(false);

  const onFocus = async () => {
    setFocused(true);

    const clipboardContent = await navigator.clipboard.readText();
    if (EMAIL_RX.test(clipboardContent) && value.length === 0) {
      onChange(clipboardContent);
    }
  };

  const onBlur = () => setFocused(false);

  function prepareSuggestion(value) {
    if (value === '') {
      return;
    }

    const domain = value.match(/@(.*)/);

    if (domain && domain[1].length > 0) {
      const match = domain[1];
      let sug;

      emailProviders.some(dm => {
        // Don't suggest if complete match
        if (
          match.toLowerCase() === dm.substr(0, match.length) &&
          match !== dm
        ) {
          sug = dm;
          return true;
        }

        return false;
      });

      if (sug) {
        const parts = value.trim().split('@');
        const suffix = sug.substr(parts[1].length, sug.length);

        setSuggestion(`<i>${value}</i>${suffix}`);

        return;
      }
    }

    setSuggestion('');
  }

  const handleChange = e => {
    const { value } = e.target;

    prepareSuggestion(value);
    onChange(value);
  };

  const onKeyDown = e => {
    //                 Right               Tab                Enter
    if (
      suggestion &&
      (e.keyCode === 39 || e.keyCode === 9 || e.key === 'Enter')
    ) {
      // Strip HTML tags and set value
      onChange(suggestion.replace(/(<([^>]+)>)/gi, ''));
      setSuggestion('');

      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      return onSubmit();
    }
  };

  const classes = [];
  if (darkMode) classes.push('dark');
  if (disabled) classes.push('disabled');
  if (error) classes.push('error');

  const suggestionClass = focused ? 'suggestion' : 'suggestion hidden';

  return (
    <div className={darkMode ? 'dark' : ''}>
      <input
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        placeholder="you@domain.com"
        onChange={handleChange}
        onKeyDown={onKeyDown}
        className={classes.join(' ')}
        disabled={disabled}
      />
      <span
        className={suggestionClass}
        dangerouslySetInnerHTML={{ __html: suggestion }}
      />
      <button onClick={onSubmit} className={disabled ? 'disabled' : ''}>
        <LoginArrow darkBg={darkMode} />
      </button>
      <style jsx>
        {`
          div {
            width: 100%;
            position: relative;
          }

          input {
            color: black;
            font-size: 14px;
            font-weight: 300;
            width: 70%;
            border: 1px solid ${darkMode ? '#565656' : '#eaeaea'};
            border-radius: 3px;
            background: 0;
            margin-top: 15px;
            padding-top: 10px;
            padding-bottom: 12px;
            padding-left: 20px;
            padding-right: 20px;
            outline: 0;
            transition: all 0.1s ease;
          }

          input:active,
          input:focus {
            border: 1px solid black;
          }

          input.dark {
            color: white;
            border-color: #666;
          }
          input.dark:active,
          input.dark:focus {
            border-color: white;
          }

          input.error {
            border-color: red;
            color: red;
          }

          .suggestion {
            color: #666;
            position: absolute;
            top: 25px;
            left: 45px;
            letter-spacing: -0.1px;
          }

          .hidden {
            display: none;
          }

          button {
            border: 0;
            background: 0;
            height: 38px;
            width: 38px;
            position: absolute;
            top: 17px;
            right: 25px;
            cursor: pointer;
          }

          input.disabled,
          button.disabled {
            opacity: 0.5;
            pointer-events: none;
            user-select: none;
          }
        `}
      </style>
      <style jsx global>
        {`
          i {
            font-style: normal;
            color: transparent;
          }
        `}
      </style>
    </div>
  );
};

LoginInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  darkMode: PropTypes.bool,
  onSubmit: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string
};

export default LoginInput;
