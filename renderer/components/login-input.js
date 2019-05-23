import PropTypes from 'prop-types';

export const EMAIL_RX = /[A-Z0-9a-z._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,64}/;

const LoginInput = ({
  onChange,
  value = '',
  darkMode,
  onSubmit,
  disabled,
  error
}) => {
  const onFocus = async () => {
    const clipboardContent = await navigator.clipboard.readText();
    if (EMAIL_RX.test(clipboardContent) && value.length === 0) {
      onChange(clipboardContent);
    }
  };

  const handleChange = e => onChange(e.target.value);
  const onKeyDown = e => {
    if (e.key === 'Enter') {
      return onSubmit();
    }
  };

  const classes = [];
  if (darkMode) classes.push('dark');
  if (disabled) classes.push('disabled');
  if (error) classes.push('error');

  return (
    <>
      <input
        onFocus={onFocus}
        value={value}
        placeholder="you@domain.com"
        onChange={handleChange}
        onKeyDown={onKeyDown}
        className={classes.join(' ')}
        disabled={disabled}
      />
      <style jsx>
        {`
          input {
            color: black;
            font-size: 14px;
            font-weight: 300;
            width: 70%;
            border: 0;
            background: 0;
            border-bottom: 1px solid #eaeaea;
            text-align: center;
            margin-top: 15px;
            padding-top: 5px;
            padding-bottom: 5px;
            outline: 0;
            transition: all 0.1s ease;
          }

          input:active,
          input:focus {
            border-bottom: 1px solid black;
          }

          input.dark {
            color: white;
            border-bottom-color: #666;
          }
          input.dark:active,
          input.dark:focus {
            border-bottom-color: white;
          }

          input.disabled {
            opacity: 0.5;
            pointer-events: none;
            user-select: none;
          }

          input.error {
            border-color: red;
            color: red;
          }
        `}
      </style>
    </>
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
