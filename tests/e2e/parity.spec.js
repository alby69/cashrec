const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.beforeEach(async ({ page }, testInfo) => {
    const appUrl = testInfo.project.use.appUrl;
    await page.goto(appUrl);
});

async function runReconciliationAndGetOutputs(page, filePath) {
    const fileInput = await page.$('#fileInput');
    await fileInput.setInputFiles(filePath);

    await page.click('#btnSubmit');
    await expect(page.locator('#resultContainer')).not.toHaveClass(/d-none/, { timeout: 15000 });

    const rawLogText = await page.textContent('#logOutput');
    const normalizedLogText = rawLogText
        .split('\n')
        .filter(line => !line.trim().startsWith('Data:'))
        .join('\n');

    const kpiHtml = await page.innerHTML('#kpiDashboard');
    const matchBadgesHtml = await page.innerHTML('#matchBadgesSummary');
    const tableRows = await page.$$eval('#anomaliesTableBody tr', rows => rows.map(r => r.innerText));

    const chartData = await page.evaluate(() => {
        const chart = Chart.getChart('monthlyChart');
        if (!chart) return null;
        return {
            labels: chart.data.labels,
            datasets: chart.data.datasets.map(ds => ({
                label: ds.label,
                data: ds.data
            }))
        };
    });

    const reportInfo = await page.evaluate(async () => {
        if (!window.generatedReportBlob) return null;
        const arrayBuffer = await window.generatedReportBlob.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const sheetsData = {};
        for (const sheetName of workbook.SheetNames) {
            sheetsData[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        }
        return {
            filename: window.generatedReportFilename,
            sheets: sheetsData
        };
    });

    return {
        logText: normalizedLogText,
        kpiHtml,
        matchBadgesHtml,
        tableRows,
        chartData,
        reportInfo
    };
}

test.describe('Standalone & Web App Mode Specifics & Parity', () => {
    test('Allowed UI differences match mode specifications', async ({ page }, testInfo) => {
        const mode = testInfo.project.name;
        const badge = await page.textContent('#resultContainer .badge');
        const versionLabel = await page.textContent('.container > .text-center.text-muted.small');

        if (mode === 'standalone') {
            expect(badge).toContain('100% Client-Side');
            expect(versionLabel).toContain('v6.0.0 Standalone HTML App — 100% Client-Side & Privacy First');
        } else {
            expect(badge).toContain('Render Web App');
            expect(versionLabel).toContain('v6.0.0 Web App — Render Dual Mode');
        }
    });

    test('No console errors during page load', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        page.on('pageerror', err => {
            errors.push(err.message);
        });
        await page.reload();
        expect(errors).toEqual([]);
    });

    test('Reconciliation outputs match expected structure and determinism', async ({ page }) => {
        const testCsv = `Data Reg.;Dare;Avere;Data Val.
01/01/2026;100,00;0;01/01/2026
02/01/2026;50,00;0;02/01/2026
02/01/2026;0;150,00;02/01/2026
`;
        const tempFilePath = path.resolve(__dirname, '../../test_parity_sample.csv');
        fs.writeFileSync(tempFilePath, testCsv, 'utf-8');

        try {
            const outputs = await runReconciliationAndGetOutputs(page, tempFilePath);

            expect(outputs.logText).toContain('Report Excel generato con successo');
            expect(outputs.reportInfo.filename).toBe('test_parity_sample_result.xlsx');
            expect(Object.keys(outputs.reportInfo.sheets)).toContain('Summary');
            expect(outputs.kpiHtml).toContain('100.0%');
        } finally {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    });

    test('Filename without extension produces correct _result.xlsx suffix', async ({ page }) => {
        const testCsv = `Data Reg.;Dare;Avere;Data Val.
01/01/2026;100,00;0;01/01/2026
02/01/2026;0;100,00;02/01/2026
`;
        const tempFilePath = path.resolve(__dirname, '../../movimenti');
        fs.writeFileSync(tempFilePath, testCsv, 'utf-8');

        try {
            const outputs = await runReconciliationAndGetOutputs(page, tempFilePath);
            expect(outputs.reportInfo.filename).toBe('movimenti_result.xlsx');
        } finally {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    });
});
