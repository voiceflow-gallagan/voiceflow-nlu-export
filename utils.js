const { faker } = require('@faker-js/faker')

function parseExportData(exportData) {
  const intents = exportData.version.platformData.intents
  const slots = exportData.version.platformData.slots

  return { intents, slots }
}

function replaceSlotValues(utterance, slots) {
  return utterance.replace(
    /(?:\s*){{\[(.*?)\]\.(.*?)}}(?:\s*)/g,
    (_, slotName, slotKey, offset) => {
      const slot = slots.find((s) => s.key === slotKey)

      if (slot) {
        const spaceBefore = offset > 0 ? ' ' : ''
        const spaceAfter = ' '

        if (slot.type.value === 'VF.EMAIL') {
          return spaceBefore + faker.internet.email() + spaceAfter
        } else if (slot.type.value === 'VF.NAME') {
          return spaceBefore + faker.name.firstName() + spaceAfter
        } else if (slot.type.value === 'VF.NUMBER') {
          return spaceBefore + faker.random.numeric(2) + spaceAfter
        } else if (slot.type.value === 'VF.PHONENUMBER') {
          return spaceBefore + faker.phone.phoneNumber() + spaceAfter
        } else if (slot.type.value === 'VF.URL') {
          return spaceBefore + faker.internet.url() + spaceAfter
        } else if (slot.type.value === 'VF.PERCENTAGE') {
          return spaceBefore + `${faker.random.numeric(2)}%` + spaceAfter
        } else if (slot.type.value === 'VF.CURRENCY') {
          return spaceBefore + `$${faker.finance.amount()}` + spaceAfter
        } else if (slot.type.value === 'VF.DATETIME') {
          return spaceBefore + faker.date.recent().toISOString() + spaceAfter
        } else if (slot.type.value === 'VF.ORDINAL') {
          return spaceBefore + ordinal(faker.random.numeric(2)) + spaceAfter
        } else if (slot.type.value === 'VF.KEY_PHRASE') {
          return spaceBefore + faker.random.word() + spaceAfter
        } else if (slot.type.value === 'VF.AGE') {
          return spaceBefore + `${faker.random.numeric(2)} years` + spaceAfter
        } else if (slot.type.value === 'VF.DIMENSION') {
          return spaceBefore + `${faker.random.numeric(2)} feet` + spaceAfter
        } else if (slot.type.value === 'VF.TEMPERATURE') {
          return (
            spaceBefore +
            `${faker.random.numeric(2)} degrees Celsius` +
            spaceAfter
          )
        } else if (slot.type.value === 'VF.GEOGRAPHY') {
          return spaceBefore + faker.address.city() + spaceAfter
        } else {
          const inputs = slot.inputs.flatMap((input) => input.split(','))
          const inputIndex = Math.floor(Math.random() * inputs.length)
          const slotValue = inputs[inputIndex]
          return spaceBefore + slotValue + spaceAfter
        }
      }
      return ''
    }
  )
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function generateCsv(intents, slots) {
  let rows = []
  let utterancesCount = 0
  let entitiesCount = 0

  intents.forEach((intent) => {
    intent.inputs.forEach((input) => {
      const utterance = replaceSlotValues(input.text, slots)
        .trim()
        .replace(/\s{2,}/g, ' ')

      const entityCount = (input.text.match(/{{\[(.*?)\]\.(.*?)}}/g) || [])
        .length
      entitiesCount += entityCount

      utterancesCount++

      const row = [intent.name, utterance]
        .map((field) => `"${field.replace(/"/g, '""')}"`)
        .join(',')
      rows.push(row)
    })
  })

  return {
    csvContent: rows.join('\n'),
    utterancesCount,
    entitiesCount,
  }
}

module.exports = { parseExportData, generateCsv }
