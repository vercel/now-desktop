const isCanary = ({ updateChannel }) => {
  return updateChannel && updateChannel === 'canary';
};

const getPlatform = () => {
  const { platform } = window.navigator;

  if (platform.toLowerCase().includes('mac')) {
    return 'darwin';
  }

  if (platform.toLowerCase().includes('win')) {
    return 'win32';
  }

  return 'linux';
};

export default (config, setLatestVersion) => {
  if (!config) {
    return;
  }

  const platform = getPlatform();

  const channel = isCanary(config) ? 'releases-canary' : 'releases';
  const feedURL = `https://now-desktop-${channel}.zeit.sh/update/${platform}`;

  fetch(`${feedURL}/${window.appVersion}`)
    .then(res => res.json())
    .then(latestVersion => {
      setLatestVersion(latestVersion ? latestVersion.name : window.appVersion);
    })
    .catch(() => {
      setLatestVersion(window.appVersion);
    });
};
