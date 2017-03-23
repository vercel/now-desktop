export default name => {
  let handle;

  switch (name) {
    case 'windows':
      handle = 'Windows';
      break;
    case 'macOS':
      handle = 'Mac';
      break;
    default:
      handle = name;
  }

  return new RegExp(handle).test(navigator.userAgent);
};
