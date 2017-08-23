const systemEvents = ['deployment-unfreeze', 'deployment-freeze', 'scale-auto']

const getEventGroup = (item, currentUser) => {
  if (systemEvents.includes(item.type)) {
    return 'system'
  }

  if (!item.user || currentUser.uid === item.user.uid) {
    return 'me'
  }

  return 'team'
}

module.exports = (typeFilter, item, currentUser) => {
  const eventGroup = getEventGroup(item, currentUser)

  if (typeFilter === 'team') {
    return eventGroup !== 'me' && eventGroup !== 'team'
  }

  // Hand back whether or not it need to
  // be removed from the list
  return typeFilter !== eventGroup
}
