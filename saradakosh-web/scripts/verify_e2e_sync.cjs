let playwright;
try {
    playwright = require('playwright');
} catch {
    playwright = require('C:/blog/node_modules/playwright');
}
const { chromium } = playwright;
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const Database = require('better-sqlite3');

(async () => {
    const saradakoshBase = 'http://127.0.0.1:8766';
    const syncSecret = process.env.SARADAKOSH_SYNC_SECRET || 'saradakosh-sync-secret-2026';
    const testClassId = 'catalog:e2e-katha-test-01';
    const testVideoId = 'K8GlawawxVg';

    const evidenceDir = path.join(__dirname, '..', '.browser-evidence');
    fs.mkdirSync(evidenceDir, { recursive: true });

    console.log('Starting End-to-End Sync & Browser Verification...');

    // 1. Send publish payload from Morning Class to SaradaKosh
    const publishPayload = {
        version: 1,
        classId: testClassId,
        sessionId: 'e2e-session-uuid-001',
        revision: 1,
        action: 'publish',
        date: '2026-10-21',
        subject: 'Katha Upanishad E2E Sync',
        chapter: 'Valli 1 · Invocation',
        title: 'कठोपनिषद् प्रथम वल्ली प्रवचन 21 Oct 2026',
        videoId: testVideoId,
        youtubeUrl: `https://youtu.be/${testVideoId}`,
        topics: [
            { startTime: '00:00:00', endTime: '00:03:30', text: 'ॐ सह नाववतु शान्ति पाठ' },
            { startTime: '00:03:31', endTime: '00:15:00', text: 'नचिकेता और यमराज का संवाद' }
        ],
        verified: true,
        transcript: {
            markdown: '# कठोपनिषद् प्रथम वल्ली प्रवचन 21 Oct 2026\n\n## ॐ सह नाववतु शान्ति पाठ\n\nॐ सह नाववतु। सह नौ भुनक्तु। सह वीर्यं करवावहै। तेजस्वि नावधीतमस्तु मा विद्विषावहै।\n\n## नचिकेता और यमराज का संवाद\n\nनचिकेता ने यमराज से आत्म-तत्व का उपदेश प्राप्त करने की प्रार्थना की।',
            hash: 'hash-katha-e2e',
            language: 'hi'
        },
        timestamp: new Date().toISOString()
    };

    console.log('Dispatching authenticated sync POST to SaradaKosh...');
    const publishRes = await fetch(`${saradakoshBase}/api/sync/classes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${syncSecret}`
        },
        body: JSON.stringify(publishPayload)
    });

    assert.equal(publishRes.status, 200, `Expected 200 OK, got ${publishRes.status}`);
    const pubData = await publishRes.json();
    assert.equal(pubData.success, true);
    assert.equal(pubData.action, 'publish');
    console.log('Sync ingest acknowledged publish successfully.');

    // 2. Browser Verification of Published Class on SaradaKosh
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

        // Navigate to /classes/Katha Upanishad E2E Sync
        const subjectUrl = `${saradakoshBase}/classes/${encodeURIComponent('Katha Upanishad E2E Sync')}`;
        console.log(`Navigating browser to: ${subjectUrl}`);
        let res = await page.goto(subjectUrl);
        assert.equal(res.status(), 200);

        // Expand details accordion
        await page.locator('details').first().evaluate(e => e.open = true);
        await page.waitForSelector('article');
        const titleText = await page.locator('article h3').first().innerText();
        console.log('Rendered article title:', titleText);
        assert.ok(titleText.includes('कठोपनिषद् प्रथम वल्ली प्रवचन'));

        // Verify chapter topics
        const topics = await page.locator('article li').allInnerTexts();
        console.log('Rendered video chapters:', topics);
        assert.ok(topics.some(t => t.includes('ॐ सह नाववतु')));
        assert.ok(topics.some(t => t.includes('नचिकेता और यमराज')));

        // Screenshot of published class card
        const cardScreenshot = path.join(evidenceDir, 'saradakosh_e2e_published_class.png');
        await page.screenshot({ path: cardScreenshot, fullPage: false });
        console.log(`Saved screenshot: ${cardScreenshot}`);

        // Navigate to transcript reader
        const transcriptUrl = `${saradakoshBase}/classes/transcripts/${testVideoId}`;
        console.log(`Navigating browser to transcript: ${transcriptUrl}`);
        res = await page.goto(transcriptUrl);
        assert.equal(res.status(), 200);

        await page.locator('#script').waitFor();
        const scriptText = await page.locator('#script').innerText();
        console.log('Transcript script length:', scriptText.length);
        assert.ok(scriptText.includes('नचिकेता ने यमराज से आत्म-तत्व का उपदेश प्राप्त करने की प्रार्थना की।'));

        // Screenshot of transcript reader
        const readerScreenshot = path.join(evidenceDir, 'saradakosh_e2e_transcript_reader.png');
        await page.screenshot({ path: readerScreenshot, fullPage: false });
        console.log(`Saved screenshot: ${readerScreenshot}`);

        // 3. Test authenticated withdrawal (tombstone)
        console.log('Sending authenticated withdraw event (tombstone)...');
        const withdrawPayload = {
            version: 1,
            classId: testClassId,
            revision: 2,
            action: 'withdraw',
            date: '2026-10-21',
            subject: 'Katha Upanishad E2E Sync',
            videoId: testVideoId
        };

        const withdrawRes = await fetch(`${saradakoshBase}/api/sync/classes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${syncSecret}`
            },
            body: JSON.stringify(withdrawPayload)
        });
        assert.equal(withdrawRes.status, 200);
        const withData = await withdrawRes.json();
        assert.equal(withData.action, 'withdraw');
        console.log('Withdraw acknowledged successfully.');

        // Verify class is immediately withdrawn from website
        res = await page.goto(subjectUrl);
        assert.equal(res.status(), 404, 'Subject route must 404 after all classes withdrawn');

        // Verify transcript route immediately returns 404
        res = await page.goto(transcriptUrl);
        assert.equal(res.status(), 404, 'Transcript route must 404 when withdrawn');
        console.log('Verified: withdrawn class immediately yields 404 on public reader.');

        // Screenshot of withdrawn 404
        const withdrawnScreenshot = path.join(evidenceDir, 'saradakosh_e2e_withdrawn_404.png');
        await page.screenshot({ path: withdrawnScreenshot, fullPage: false });
        console.log(`Saved screenshot: ${withdrawnScreenshot}`);

        console.log('\n========================================');
        console.log('PASS: End-to-End Sync & Browser Verification 100% Successful!');
        console.log('========================================\n');

    } finally {
        await browser.close();

        // Clean up test records from saradakosh.db
        const dbPath = path.join(__dirname, '..', 'saradakosh.db');
        const db = new Database(dbPath);
        try {
            db.prepare('DELETE FROM synced_classes WHERE class_id = ?').run(testClassId);
            db.prepare('DELETE FROM synced_transcripts WHERE video_id = ?').run(testVideoId);
        } finally {
            db.close();
        }
    }
})().catch(err => {
    console.error('E2E Sync Verification Failed:', err);
    process.exit(1);
});
