import Router from 'next/router';
import React, { useState, useEffect } from 'react';
import Title from '../components/title';
import LoginInput, { EMAIL_RX } from '../components/login-input';
import Checkbox from '../components/checkbox';
import darkModeEffect from '../effects/dark-mode';
import Logo from '../vectors/logo-about';
import loadData from '../utils/load';
import ipc from '../utils/ipc';
import { API_REGISTRATION } from '../utils/endpoints';

const getHost = () => {
  const { platform } = navigator;
  if (!platform) {
    return '';
  }

  if (platform.toLowerCase().includes('mac')) {
    return ' on macOS';
  }

  if (platform.toLowerCase().includes('win')) {
    return ' on Windows';
  }

  return '';
};

let checker = null;

const Login = () => {
  const [darkMode, setDarkMode] = useState(null);

  const [inputValue, setInput] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [inputError, setInputError] = useState(null);
  const [securityCode, setSecurityCode] = useState(null);
  const [updateCLI, setUpdateCLI] = useState(true);

  useEffect(() => {
    return darkModeEffect(darkMode, setDarkMode);
  });

  const handleInput = value => {
    setInputError(false);
    setInput(value);
  };

  // Timer

  const handleSubmit = async () => {
    if (!EMAIL_RX.test(inputValue)) {
      return setInputError('Please enter a valid email');
    }

    setInputDisabled(true);

    const { token: preauthToken, securityCode: code, error } = await loadData(
      API_REGISTRATION,
      null,
      {
        method: 'POST',
        body: JSON.stringify({
          email: inputValue,
          tokenName: 'Now Desktop' + getHost()
        })
      }
    );

    if (!preauthToken) {
      setInputDisabled(false);
      setInputError(error || 'The email you entered is invalid');

      return;
    }

    setSecurityCode(code);
    setInputDisabled(false);

    checker = setInterval(async () => {
      const res = await loadData(
        `${API_REGISTRATION}/verify?email=${inputValue}&token=${preauthToken}`
      );

      // If token is valid and user didn't cancel the login
      if (res && res.token) {
        clearInterval(checker);
        const { token } = res;

        await ipc.saveConfig({ token }, 'auth');
        await ipc.saveConfig(
          {
            desktop: {
              updateCLI
            }
          },
          'config'
        );

        const feedPath = window.location.href.includes('http')
          ? '/main'
          : `${window.appPath}/renderer/out/main/index.html`;

        Router.replace(feedPath);

        ipc.showWindow();
      }
    }, 3000);
  };

  const reset = () => {
    clearInterval(checker);
    setInput('');
    setInputDisabled(false);
    setInputError(false);
    setSecurityCode(null);
  };

  return (
    <main className={darkMode ? 'dark' : ''}>
      <Title darkMode={darkMode} title="Welcome to Now" />

      <section>
        <Logo darkMode={darkMode} />
        {securityCode ? (
          <>
            <h2>Verify Your Identity</h2>
            <span className="notice">
              We sent an email to <b>{inputValue}</b>
              <br />
              Please follow the instructions.
            </span>
            <span className="code-label">Your security code is:</span>
            <span className="code">{securityCode}</span>
            <button className="cancel" onClick={reset}>
              ← Use a different email address
            </button>
          </>
        ) : (
          <>
            <h2>Login with Email</h2>
            <span className="start">
              To start using the app, enter your email address below:
            </span>
            <div
              style={{ textAlign: 'left', cursor: 'pointer', width: 250 }}
              onClick={() => setUpdateCLI(!updateCLI)}
            >
              <span className="auto-update-cli">
                <Checkbox
                  checked={updateCLI}
                  label="Auto-Update Now CLI"
                  name="Auto-Update Now CLI"
                  style={{ marginTop: 2, marginRight: 3 }}
                  onChange={(event, checked) => setUpdateCLI(checked)}
                />{' '}
                Install&nbsp;<strong>Now Command Line Interface</strong>
              </span>
              <span className="auto-update-permissions">
                May require extra permissions
              </span>
            </div>
            <LoginInput
              darkMode={darkMode}
              value={inputValue}
              onChange={handleInput}
              onSubmit={handleSubmit}
              disabled={inputDisabled}
              error={inputError}
            />
            <span className={`error ${inputError ? 'visible' : ''}`}>
              {inputError}
            </span>
          </>
        )}
      </section>

      <style jsx>{`
        main,
        div {
          display: flex;
          flex-direction: column;
        }

        main {
          height: 100vh;
          background-color: white;
        }

        section {
          width: 90%;
          height: 100%;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-size: 14px;
          text-align: center;
          line-height: 20px;
        }

        .dark {
          background-color: #1f1f1f;
        }

        h2 {
          color: black;
          font-size: 20px;
        }

        .start {
          margin-top: 10px;
          line-height: 24px;
          color: black;
        }

        .dark .start {
          color: white;
        }

        main.dark {
          background-color: #1f1f1f;
        }

        .error {
          opacity: 0;
          transition: opacity 0.1s ease;
          color: red;
          font-size: 12px;
          height: 12px;
          margin-top: 5px;
        }

        .error.visible {
          opacity: 1;
        }

        .dark .error {
          color: #ff6363;
        }

        .notice {
          font-size: 14px;
          line-height: 24px;
        }

        .code {
          display: flex;
          width: 80%;
          color: white;
          background-color: black;
          justify-content: center;
          align-items: center;
          padding-top: 10px;
          padding-bottom: 10px;
          margin-top: 15px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 16px;
        }

        .dark h2 {
          color: white;
        }

        .dark .code {
          color: black;
          background-color: white;
        }

        .auto-update-cli {
          color: black;
          font-size: 12px;
          display: flex;
          align-items: center;
          margin-top: 10px;
        }

        .dark .auto-update-cli,
        .dark .notice,
        .dark h3 {
          color: white;
        }

        .auto-update-permissions {
          font-size: 12px;
          color: #999;
          margin-left: 20px;
        }

        .code-label {
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          color: black;
          margin-top: 35px;
        }

        .dark .code-label {
          color: white;
        }

        button.cancel {
          margin-top: 13px;
          margin-bottom: 13px;
          border: 0;
          background: 0;
          outline: 0;
          font-size: 14px;
          color: #0076ff;
          cursor: pointer;
        }

        .dark button.cancel {
          color: white;
        }
      `}</style>

      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Helvetica Neue, sans-serif;
          -webkit-font-smoothing: antialiased;
          margin: 0;
          overflow: hidden;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          user-select: none;
        }
      `}</style>
    </main>
  );
};

export default Login;
