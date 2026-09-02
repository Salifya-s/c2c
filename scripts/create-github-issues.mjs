import { readFile } from 'node:fs/promises';
import path from 'node:path';

const REPO_OWNER = 'Salifya-s';
const REPO_NAME = 'c2c';

async function createIssues() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (!token) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is not set.');
    console.log('\nTo create issues automatically, run:');
    console.log('  $env:GITHUB_TOKEN="your_personal_access_token"; node scripts/create-github-issues.mjs\n');
    process.exit(1);
  }

  const issuesFilePath = path.join(process.cwd(), '.github', 'GITHUB_ISSUES.md');
  const content = await readFile(issuesFilePath, 'utf8');

  // Split into sections by issue title (## Header)
  const sections = content.split(/\n(?=## \d+\. )/);
  const issuesToCreate = [];

  for (const section of sections) {
    const titleMatch = section.match(/## \d+\. (\[.*\] .*)/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();

    // Extract labels
    const labelsMatch = section.match(/\*\*Labels:\*\* `(.*?)`/);
    const labels = labelsMatch ? labelsMatch[1].split('`, `') : [];

    // Extract body content starting after the header line
    const bodyLines = section.split('\n').slice(1);
    const body = bodyLines.join('\n').trim();

    issuesToCreate.push({ title, body, labels });
  }

  console.log(`🚀 Found ${issuesToCreate.length} issues to author on GitHub repository ${REPO_OWNER}/${REPO_NAME}...\n`);

  for (const issue of issuesToCreate) {
    console.log(`Creating issue: "${issue.title}"...`);

    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'AICOS-Issue-Author-Agent'
      },
      body: JSON.stringify({
        title: issue.title,
        body: issue.body,
        labels: issue.labels
      })
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`  ✓ Created Issue #${data.number}: ${data.html_url}`);
    } else {
      const errorText = await res.text();
      console.error(`  ❌ Failed to create issue. Status: ${res.status}. Response: ${errorText}`);
    }
  }

  console.log('\n🎉 Finished authoring all GitHub issues!');
}

createIssues().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
