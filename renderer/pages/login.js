import Router from 'next/router';
import React, { useState, useEffect } from 'react';
import Title from '../components/title';
import LoginInput, { EMAIL_RX } from '../components/login-input';
import Checkbox from '../components/checkbox';
import darkModeEffect from '../effects/dark-mode';
import Logo from '../vectors/logo';
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

const Login = () => {
  const [darkMode, setDarkMode] = useState(null);

  const [inputValue, setInput] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [securityCode, setSecurityCode] = useState(null);
  const [updateCLI, setUpdateCLI] = useState(true);

  useEffect(() => {
    return darkModeEffect(darkMode, setDarkMode);
  });

  const handleInput = value => {
    setInputError(false);
    setInput(value);
  };

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

    const checker = setInterval(async () => {
      const { token } = await loadData(
        `${API_REGISTRATION}/verify?email=${inputValue}&token=${preauthToken}`
      );

      if (token) {
        clearInterval(checker);

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
          ? '/feed'
          : `${window.appPath}/renderer/out/feed/index.html`;

        Router.replace(feedPath);
      }
    }, 3000);
  };

  return (
    <main className={darkMode ? 'dark' : ''}>
      <Title darkMode={darkMode} title="Welcome to Now" />

      <section>
        <Logo darkMode={darkMode} />
        {securityCode ? (
          <>
            <h2>Verify your identity</h2>
            <span className="notice">
              We sent an email to <b>{inputValue}</b>
              <br />
              Please follow the instructions.
            </span>
            <span className="code-label">Your security code is:</span>
            <span className="code">{securityCode}</span>
          </>
        ) : (
          <>
            <h2>Log in to ZEIT Now</h2>
            <span className="start">
              To start using the app, enter your email address below:
            </span>
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
            <div style={{ textAlign: 'left' }}>
              <span className="auto-update-cli">
                <Checkbox
                  checked={updateCLI}
                  label="Auto-Update Now CLI"
                  name="Auto-Update Now CLI"
                  style={{ marginTop: 2, marginRight: 3 }}
                  onChange={(event, checked) => setUpdateCLI(checked)}
                />{' '}
                Install&nbsp;<strong>ZEIT Now Command Line Interface</strong>
              </span>
              <span className="auto-update-permissions">
                May require extra permissions
              </span>
            </div>
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

        h2 {
          color: black;
          font-size: 20px;
        }

        .start {
          margin-top: 15px;
          line-height: 24px;
          color: black;
        }

        .dark .start {
          color: white;
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

        .notice {
          font-size: 14px;
          line-height: 24px;
        }

        .code {
          display: flex;
          width: 80%;
          color: black;
          background-color: #f7f7f7;
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
          color: white;
          background-color: #333;
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
          margin-top: 50px;
        }

        .dark .code-label {
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
