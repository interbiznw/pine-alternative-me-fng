import pkg from '../package.json'
import * as pine from './pine.mjs'

const stripLeadingZero = string => string.replace(/^0/, '')

const ScriptTemplate = ({ fngData }) => {
	const fngYearsMap = fngData
	.map(({ value, timestamp }) => {
		const [ year, monthWithLeadingZero, dayWithLeadingZero ] = new Date(Number(timestamp) * 1000).toISOString().split('T').shift().split('-')
		const month = stripLeadingZero(monthWithLeadingZero)
		const day = stripLeadingZero(dayWithLeadingZero)
		return { year, month, day, value }
	})
	.reduce((yearsMap, { year, month, day, value }) => {
		yearsMap[year] = yearsMap[year] || {}
		yearsMap[year][month] = yearsMap[year][month] || {}
		yearsMap[year][month][day] = { value }
		return yearsMap
	}, {})

const monthMapToCondition = monthMap => Object.entries(monthMap).reverse()
  .map(([ day, { value }]) => `dayofmonth == ${day} ? ${value}`)
	.concat('na')
	.join(`\n${' '.repeat(9)}: `)

const yearMapToCondition = yearMap => Object.entries(yearMap).reverse()
  .map(([ month, monthMap ]) => `month == ${month} ?\n${' '.repeat(9)}(${monthMapToCondition(monthMap)})`)
	.concat('na')
	.join(`\n${' '.repeat(6)}: `)

const yearsMapToCondition = yearsMap => Object.entries(yearsMap).reverse()
	.map(([ year, yearMap ]) => `year == ${year} ?\n${' '.repeat(6)}(${yearMapToCondition(yearMap)})`)
	.concat('na')
	.join('\n   : ')

const fngValueCondition = yearsMapToCondition(fngYearsMap)

return `
//@version=3
study("interbiznw Crypto Fear & Greed Index [j622020]", shorttitle="Fear & Greed (J62-interbiznw)", precision=0)

${pine.comment(
`
This script was generated from ${pkg.repository.url}

Issues? ${pkg.bugs}


----- DESCRIPTION

Crypto Fear & Greed Index is produced by [alternative.me](https://alternative.me/crypto/fear-and-greed-index/).
This script is authored by [@j622020](https://www.tradingview.com/u/j622020/)

alternative.me description:
-------------------
The crypto market behaviour is very emotional. People tend to get greedy when the market is rising which results in FOMO (Fear of missing out). Also, people often sell their coins in irrational reaction of seeing red numbers. With our Fear and Greed Index, we try to save you from your own emotional overreations. There are two simple assumptions:

Extreme fear can be a sign that investors are too worried. That could be a buying opportunity.
When Investors are getting too greedy, that means the market is due for a correction.
Therefore, we analyze the current sentiment of the Bitcoin market and crunch the numbers into a simple meter from 0 to 100. Zero means "Extreme Fear", while 100 means "Extreme Greed".

See [alternative.me](https://alternative.me/crypto/fear-and-greed-index/) for further information.
`)}


//----- VALUES

fngValue = ${fngValueCondition}


//----- RENDER

color_neutral = #444444
color_veryExtremeGreed = #6AFF00
color_extremeGreed = #63A924
color_fear = #D35499
color_extremeFear = #D35400
color_veryExtremeFear = #FE4E00

fngColor = fngValue >= 90 ? color_veryExtremeGreed
   : fngValue >= 75 ? color_extremeGreed
   : fngValue <= 40 ? color_fear
   : fngValue <= 10 ? color_veryExtremeFear
   : fngValue <= 25 ? color_extremeFear
   : color_neutral

hline(90, title="Very Extreme Greed", color=color_veryExtremeGreed, linewidth=2, linestyle=solid)
hline(75, title="Extreme Greed",      color=color_extremeGreed, linewidth=2, linestyle=solid)
hline(40, title="FEAR",      color=color_fear, linewidth=2, linestyle=solid)
hline(25, title="Extreme Fear",       color=color_extremeFear, linewidth=2, linestyle=solid)
hline(10, title="Very Extreme Fear",  color=color_veryExtremeFear, linewidth=2, linestyle=solid)

plot(fngValue, color=fngColor, linewidth=3, style=areabr)
`
}

export default ScriptTemplate
