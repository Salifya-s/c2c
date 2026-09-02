#!/usr/bin/env node

import {execFileSync} from 'node:child_process';

const token = process.env.GITHUB_TOKEN;
const [, , command, ...args] = process.argv;

const usage = `
GitHub issue helper

Required:
  Set GITHUB_TOKEN in your shell before running this script.

Commands:
  list [state]                         List issues. state: open, closed, all.
  create <title> <body>                Create an issue.
  comment <number> <body>              Comment on an issue.
  close <number> [comment]             Close an issue, optionally with a comment.
  reopen <number> [comment]            Reopen an issue, optionally with a comment.

Examples:
  node scripts/github-issues.mjs list open
  node scripts/github-issues.mjs create "Add real cart API" "Replace local cart storage with backend persistence."
  node scripts/github-issues.mjs close 12 "Implemented and validated."
`;

const main = async () => {
  if (!command || command === 'help') fail(usage, 0);
  if (!token) fail('Missing GITHUB_TOKEN. Create a fresh fine-scoped GitHub token and set it only in your shell session.');

  const repo = resolveRepo();

  if (command === 'list') {
    const state = args[0] ?? 'open';
    const issues = await github(`/repos/${repo}/issues?state=${encodeURIComponent(state)}&per_page=100`);
    issues
      .filter((issue) => !issue.pull_request)
      .forEach((issue) => {
        console.log(`#${issue.number} [${issue.state}] ${issue.title}`);
      });
    return;
  }

  if (command === 'create') {
    const [title, body = ''] = args;
    if (!title) fail('Missing issue title.');
    const issue = await github(`/repos/${repo}/issues`, {method: 'POST', body: {title, body}});
    console.log(`Created #${issue.number}: ${issue.html_url}`);
    return;
  }

  if (command === 'comment') {
    const [number, body] = args;
    if (!number || !body) fail('Usage: comment <number> <body>');
    const comment = await github(`/repos/${repo}/issues/${number}/comments`, {method: 'POST', body: {body}});
    console.log(`Commented: ${comment.html_url}`);
    return;
  }

  if (command === 'close' || command === 'reopen') {
    const [number, comment] = args;
    if (!number) fail(`Usage: ${command} <number> [comment]`);
    if (comment) await github(`/repos/${repo}/issues/${number}/comments`, {method: 'POST', body: {body: comment}});
    const state = command === 'close' ? 'closed' : 'open';
    const issue = await github(`/repos/${repo}/issues/${number}`, {method: 'PATCH', body: {state}});
    console.log(`${command === 'close' ? 'Closed' : 'Reopened'} #${issue.number}: ${issue.html_url}`);
    return;
  }

  fail(`Unknown command: ${command}\n${usage}`);
};

const github = async (path, options = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    fail(payload.message ?? `GitHub API failed with ${response.status}`);
  }
  return payload;
};

const resolveRepo = () => {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;

  const remote = execFileSync('git', ['remote', 'get-url', 'origin'], {encoding: 'utf8'}).trim();
  const match = remote.match(/github\.com[:/](?<owner>[^/]+)\/(?<name>[^/.]+)(?:\.git)?$/);
  if (!match?.groups) fail('Could not detect GitHub repository from origin remote. Set GITHUB_REPOSITORY=owner/repo.');
  return `${match.groups.owner}/${match.groups.name}`;
};

const fail = (message, code = 1) => {
  console.error(message);
  process.exit(code);
};

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
