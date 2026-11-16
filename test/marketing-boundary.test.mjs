import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expectedFiles } from '../scripts/verify-site.mjs';

const app = { slug: 'voxwarm', name: 'Voxwarm', repo: 'owner/voxwarm', appStoreId: '6796622537' };
const product = { app: 'voxwarm', route: 'voxwarm', content: 'marketing/apps/voxwarm.json' };
const manifest = (entry) => ({ appOrder: [entry.app], products: [entry], resources: [], assets: [] });

test('refuses a marketed product whose app identity is unknown', () => {
  assert.throws(() => expectedFiles([app], [], manifest({ ...product, app: 'unknown-app' })), /unknown.*app/i);
});

test('refuses a marketed product without a released App Store identity', () => {
  const unreleased = { slug: app.slug, name: app.name, repo: app.repo };
  assert.throws(() => expectedFiles([unreleased], [], manifest(product)), /app store|appstoreid|store id/i);
});

test('refuses marketing routes that replace legacy privacy or escape their namespace', () => {
  for (const route of ['privacy', '../private-notes', 'voxwarm/../../private-notes']) {
    assert.throws(() => expectedFiles([app], [], manifest({ ...product, route })), /route|reserved|unsafe|invalid/i);
  }
});
