import makeUnique from 'make-unique';

const merge = (first, second) => {
  const merged = first.concat(second);
  return makeUnique(merged, (a, b) => a.id === b.id);
};

export default (scopeOrder, scopes) => {
  const newScopes = [];

  if (!Array.isArray(scopeOrder) || scopeOrder.length === 0) {
    return scopes;
  }

  for (const position of scopeOrder) {
    const index = scopeOrder.indexOf(position);

    newScopes[index] = scopes.find(scope => {
      const name = scope.slug || scope.name;
      return name === position;
    });
  }

  // Apply the new data at the end, but keep order
  return merge(newScopes, scopes);
};
