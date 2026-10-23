import fs from 'node:fs';
import assert from 'node:assert/strict';
import { learningPathways, pathwayLessons } from '../app/learning-pathways.ts';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const links = learningPathways.flatMap(pathwayLessons);
const artifactDir = process.env.REVIEW_ARTIFACTS || '/tmp/sonic-academy-review';
fs.mkdirSync(artifactDir, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  try {
    const p = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      ignoreHTTPSErrors: true,
      reducedMotion: 'reduce',
    });
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const base = process.env.REVIEW_URL || 'http://127.0.0.1:3011';
    let checks = 0;
    await p.goto(base);
    await p.locator('.academy-hero').waitFor();
    const sidebar = await p
      .locator(
        '.console-sidebar nav a,.console-sidebar .academy-secondary-nav a',
      )
      .allTextContents();
    assert.deepEqual(
      sidebar.map((s) => s.trim()),
      [
        'Dashboard',
        'Learning Paths',
        'All Courses',
        'Start Your Lab',
        'My Bookmarks',
        'Troubleshooting',
      ],
    );
    assert.equal(await p.locator('.reader-course').count(), 0);
    const profile = p
      .getByRole('link', { name: 'My profile', exact: true })
      .first();
    assert.equal(
      await profile.evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgba(0, 0, 0, 0)',
    );
    await profile.hover();
    assert.equal(
      await profile.evaluate((e) => getComputedStyle(e).outlineStyle),
      'solid',
    );
    await profile.click();
    await p.waitForURL('**/profile');
    for (const career of [
      'windows-system-administration',
      'azure-cloud-engineering',
      'cyber-analyst',
      'linux-system-administration',
    ]) {
      await p.goto(base + '/?view=paths&path=' + career);
      await p.locator('.course-library h1').waitFor();
      await p.waitForFunction(() =>
        document
          .querySelector('.course-library h1')
          ?.textContent.includes('Pathway'),
      );
      assert.ok(await p.locator('.path-card').count());
      if (career === 'cyber-analyst') {
        await p.locator('.cyber-map').waitFor();
        assert.equal(
          await p
            .locator('.cyber-map h2')
            .evaluate((e) => getComputedStyle(e).color),
          'rgb(247, 241, 232)',
        );
        await p.getByRole('button', { name: 'Pause animation' }).click();
        assert.equal(
          await p.locator('.cyber-map').getAttribute('class'),
          'cyber-map is-paused',
        );
        await p.screenshot({
          path: artifactDir + '/cyber-pathway-desktop.png',
        });
      }
    }
    for (const [n, l] of links.entries()) {
      await p.goto(base + l.href, { waitUntil: 'domcontentloaded' });
      await p.locator(`[data-lesson-id="${l.id}"]`).waitFor({ timeout: 20000 });
      await p.waitForFunction(() => {
        const field = document.querySelector('fieldset');
        return !field || !field.disabled;
      });
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        l.id + ' desktop overflow',
      );
      const select = p.locator('.guided-step-picker select');
      if (await select.count()) {
        await p.waitForFunction(() =>
          Object.keys(
            document.querySelector('.guided-step-picker select') ?? {},
          ).some((k) => k.startsWith('__reactProps$')),
        );
        const total = await select.locator('option').count();
        const indices = l.id.startsWith('splunk-')
          ? [...Array(total).keys()]
          : [...new Set([0, total - 1])];
        for (const i of indices) {
          await select.selectOption(String(i));
          await p.waitForFunction(
            (i) =>
              document
                .querySelector('.guided-step-number')
                ?.textContent.includes('STEP ' + (i + 1) + ' OF'),
            i,
          );
          const state = await p.locator('.guided-step').evaluate((el) => {
            const visual = el.querySelector('.guided-visuals'),
              nav = el.querySelector('.guided-pagination'),
              check = el.querySelector('.guided-check');
            return {
              ordered:
                !!visual &&
                !!nav &&
                !!check &&
                !!(
                  visual.compareDocumentPosition(check) &
                  Node.DOCUMENT_POSITION_FOLLOWING
                ) &&
                !!(
                  check.compareDocumentPosition(nav) &
                  Node.DOCUMENT_POSITION_FOLLOWING
                ),
              width: el
                .querySelector('.guided-step-content')
                ?.getBoundingClientRect().width,
              container: el.getBoundingClientRect().width,
              hidden: !!el.querySelector(
                '.guided-action details,.guided-command details,.guided-visuals details:not([open])',
              ),
            };
          });
          assert.ok(state.ordered, l.id + ' screenshot/check/navigation order');
          assert.equal(state.hidden, false, l.id + ' essential content hidden');
          assert.ok(
            state.width > state.container * 0.85,
            l.id + ' content uses workspace',
          );
          checks++;
        }
      }
      if (n % 25 === 0)
        console.log(
          'Checked',
          n + 1,
          '/',
          links.length,
          l.id,
          'step states',
          checks,
        );
    }
    for (const width of [320, 390, 768, 1920]) {
      await p.setViewportSize({ width, height: 950 });
      for (const path of [
        '/?view=paths&path=cyber-analyst',
        '/?view=courses&subject=mecm',
        '/migration#lesson=mecm-01',
        '/alma#lesson=alma-plan',
        '/splunk#lesson=splunk-dashboard-inputs',
        '/',
      ]) {
        await p.goto(base + path);
        await p.locator('.reader-workspace').waitFor();
        await p.waitForTimeout(250);
        assert.equal(
          await p.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          path + ' overflow ' + width,
        );
      }
    }
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.goto(base + '/splunk#lesson=splunk-injection');
    await p.waitForFunction(() => {
      const field = document.querySelector('fieldset');
      return field && !field.disabled;
    });
    await p.waitForFunction(() =>
      Object.keys(
        document.querySelector('.guided-step-picker select') ?? {},
      ).some((k) => k.startsWith('__reactProps$')),
    );
    await p.locator('.guided-step-picker select').selectOption('1');
    await p.waitForFunction(() =>
      document
        .querySelector('.guided-step-number')
        ?.textContent.includes('STEP 2 OF'),
    );
    const image = p.locator('.guided-step .guided-screenshot img').first();
    await image.evaluate((e) =>
      e.scrollIntoView({ behavior: 'instant', block: 'center' }),
    );
    await p.waitForFunction(
      () =>
        document.querySelector('.guided-step .guided-screenshot img')
          ?.naturalWidth > 0,
    );
    await p.screenshot({ path: artifactDir + '/splunk-injection-example.png' });
    await p.locator('.guided-step .guided-image-button').first().click();
    await p.locator('dialog[open]').waitFor();
    await p.getByRole('button', { name: 'Close picture ×' }).click();
    const checked = p.getByRole('checkbox', {
      name: 'I checked this result in my own lab',
      exact: true,
    });
    await checked.check();
    await p.reload();
    await p.waitForFunction(
      () => document.querySelector('fieldset')?.disabled === false,
    );
    await p.locator('.guided-step-picker select').selectOption('1');
    await p.waitForFunction(() =>
      document
        .querySelector('.guided-step-number')
        ?.textContent.includes('STEP 2 OF'),
    );
    await checked.waitFor();
    assert.equal(await checked.isChecked(), true);
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        lessons: links.length,
        stepStates: checks,
        viewports: [320, 390, 768, 1440, 1920],
        errors,
        pass: true,
      }),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
