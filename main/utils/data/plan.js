// Packages
const ms = require('ms')

// Utilities
const loadData = require('./load')

async function parsePlan(json) {
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

module.exports = async () => {
  const json = await loadData('api/plan')
  return parsePlan(json)
}
