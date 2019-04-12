import makeUnique from 'make-unique';

const merge = (first, second) => {
  const merged = first.concat(second);
  return makeUnique(merged, (a, b) => a.id === b.id);
};

const getOrder = config => {
  if (!config || !config.desktop || !config.desktop.scopeOrder) {
    return false;
  }

  const order = config.desktop.scopeOrder;

  if (!Array.isArray(order) || order.length === 0) {
    return false;
  }

  return order;
};

export default (config, scopes, setScopes) => {
  const newScopes = [];
  const order = getOrder(config);

  if (!order) {
    return;
  }

  for (const position of order) {
    const index = order.indexOf(position);

    newScopes[index] = scopes.find(scope => {
      const name = scope.slug || scope.name;
      return name === position;
    });
  }

  // Apply the new data at the end, but keep order
  const merged = merge(newScopes, scopes);

  setScopes(merged);
};
