export default ({ currentTeam }, scopes, setActive) => {
  let active = null;

  if (currentTeam) {
    active = scopes.find(scope => scope.id === currentTeam);
  }

  // If no current team is defined, fall back to the user
  if (!active) {
    active = scopes.find(scope => scope.isCurrentUser);
  }

  setActive(active);
};
