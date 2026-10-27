import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const site = process.env.TEST_SITE_URL || 'http://127.0.0.1:3000'
const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--no-sandbox'] })
const widthCases = [360, 390, 430, 768, 1280]
const root = 'test-screenshots'
await mkdir(root, { recursive: true })
try {
  for (const width of widthCases) {
    const page = await browser.newPage({
      viewport: { width, height: 830 },
      deviceScaleFactor: 1,
      isMobile: width < 900,
      hasTouch: width < 900,
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(site, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(650)
    const state = await page.evaluate(() => ({
      viewport: window.innerWidth,
      doc: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      nav: getComputedStyle(document.querySelector('.desktop-nav')).display,
      menu: getComputedStyle(document.querySelector('#menu-toggle')).display,
      title: document.querySelector('#hero-title').getBoundingClientRect().width,
      button: document.querySelector('#menu-toggle').getBoundingClientRect().width,
    }))
    await page.screenshot({ path: root + '/maya-' + width + '.png', fullPage: false })
    assert.ok(state.doc <= state.viewport + 2, 'Horizontal scroll at ' + width + ': ' + JSON.stringify(state))
    assert.ok(state.body <= state.viewport + 2, 'Body overflow at ' + width + ': ' + JSON.stringify(state))
    assert.ok(state.title > 0 && state.title <= state.viewport, 'Hero title overflow at ' + width)
    const artwork = await page.locator('.cinema-scene-art').evaluate(image => ({
      loaded: image.complete && image.naturalWidth > 0, width: image.naturalWidth
    }))
    assert.ok(artwork.loaded, '3D hero artwork failed to load at '+width)
    assert.equal(await page.locator('.cinema-copy h1').count(),1)
    assert.equal(await page.locator('.cinema-feature-art img').count(),1)
    await page.locator('.cinema-feature-art img').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => {
      const image = document.querySelector('.cinema-feature-art img')
      return image && image.complete && image.naturalWidth > 0
    }, null, { timeout: 10000 })
    const servicesBeforeCompany = await page.evaluate(() =>
      document.querySelector('#services').compareDocumentPosition(document.querySelector('#about')) &
      Node.DOCUMENT_POSITION_FOLLOWING)
    assert.ok(servicesBeforeCompany, 'Services should follow hero before company section')

    if (width < 900) {
      assert.equal(state.nav, 'none', 'Desktop nav must be hidden at ' + width)
      assert.notEqual(state.menu, 'none', 'Hamburger must appear at ' + width)
      assert.ok(state.button >= 40, 'Menu touch target too small at ' + width)
      const menu = page.locator('#menu-toggle')
      await menu.click()
      assert.equal(await menu.getAttribute('aria-expanded'), 'true')
      assert.equal(await page.locator('#mobile-menu').isVisible(), true)
      assert.ok(await page.locator('.mobile-whatsapp').getAttribute('href').then(h => h.includes('wa.me/256757742177')))
      await page.locator('#mobile-menu a[href="#services"]').click()
      assert.equal(await menu.getAttribute('aria-expanded'), 'false')
    } else {
      assert.notEqual(state.nav, 'none', 'Desktop nav unexpectedly hidden')
    }
    assert.ok((await page.locator('.axis-service-order').count()) === 6)
    const orderHref = await page.locator('.axis-service-order').first().getAttribute('href')
    assert.match(orderHref, /wa\.me\/256757742177\?text=/)
    const gallery = page.locator('.gallery-item').first()
    await gallery.scrollIntoViewIfNeeded()
    await gallery.click()
    assert.equal(await page.locator('#gallery-dialog').evaluate(d => d.open), true, 'Gallery dialog failed')
    await page.locator('#dialog-close').click()
    await page.locator('#name').fill('Test Customer')
    await page.locator('#phone').fill('0700000000')
    await page.locator('#service').selectOption({ label: 'Pressed Ribbed Plates' })
    await page.locator('#quote-form button[type="submit"]').click()
    assert.equal(await page.locator('#review-dialog').evaluate(d => d.open), true, 'WhatsApp quote review failed')
    const orderReview = await page.locator('#send-whatsapp').getAttribute('href')
    assert.match(orderReview, /wa\.me\/256757742177\?text=/)
    await page.locator('#review-close').click()
    assert.deepEqual(errors, [], 'Page JavaScript errors at ' + width + ': ' + errors.join('; '))
    console.log('PASS Chromium viewport ' + width + ', navigation, gallery and WhatsApp quote')
    await page.close()
  }
} finally {
  await browser.close()
}
