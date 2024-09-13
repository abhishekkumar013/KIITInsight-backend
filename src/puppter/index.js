import puppeteer from 'puppeteer'
import { promises as fs } from 'fs'

async function scrapeFacultyData() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: ['--start-maximized'],
  })
  const page = await browser.newPage()

  try {
    await page.goto('https://cse.kiit.ac.in/faculty/', {
      waitUntil: 'networkidle0',
      timeout: 60000,
    })

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0
        const distance = 100
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance

          if (totalHeight >= scrollHeight) {
            clearInterval(timer)
            resolve()
          }
        }, 100)
      })
    })

    const facultyData = await page.evaluate(() => {
      const facultyDivs = document.querySelectorAll(
        'div.wph_element.wmts_horizontal_round.wmts_element.wmts_member',
      )
      return Array.from(facultyDivs)
        .map((div) => {
          const name = div.querySelector('.wmts_name')?.innerText.trim() || ''
          const emailElement = div.querySelector(
            'div[data-wph-type="attribute"] a[href^="mailto:"]',
          )
          const email = emailElement
            ? emailElement.href.replace('mailto:', '').trim()
            : ''
          const imageElement = div.querySelector(
            'div[data-wph-type="container"] img[data-wph-type="image"]',
          )
          const imageUrl = imageElement ? imageElement.src : ''
          return { name, email, imageUrl }
        })
        .filter((faculty) => faculty.name !== '')
    })

    await browser.close()

    return facultyData
  } catch (error) {
    console.error('An error occurred while scraping:', error)
    await browser.close()
    throw error
  }
}

async function saveFacultyDataToJson(data) {
  try {
    await fs.writeFile('faculty_data.json', JSON.stringify(data, null, 2))
    console.log(
      `Data has been saved to faculty_data.json. Total faculty members: ${data.length}`,
    )
  } catch (error) {
    console.error('An error occurred while saving the data to file:', error)
  }
}

scrapeFacultyData()
  .then((data) => saveFacultyDataToJson(data))
  .catch((error) => console.error('An error occurred:', error))
