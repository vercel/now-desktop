// Packages
const ms = require('ms')

// Utilities
const { getConfig } = require('../config')
const { error: handleError } = require('../error')
const loadData = require('./load')

const parsePlan = async json => {
  const { subscription } = json
  let id
  let until
  let name

  if (subscription) {
    const planItems = subscription.items.data
    const mainPlan = planItems.find(d => d.plan.metadata.is_main_plan === '1')

    if (mainPlan) {
      id = mainPlan.plan.id
      name = mainPlan.plan.name
      if (subscription.cancel_at_period_end) {
        until = ms(
          new Date(subscription.current_period_end * 1000) - new Date(),
          { long: true }
        )
      }
    } else {
      id = 'oss'
    }
  } else {
    id = 'oss'
  }

  return { id, name, until }
}

const getToken = async () => {
  let config

  try {
    config = await getConfig()
  } catch (err) {
    handleError('Not able to retrieve local token')
    return null
  }

  return config.token
}

module.exports = async () => {
  const token = await getToken()
  const json = await loadData('api/plan', token)

  return parsePlan(json)
}
