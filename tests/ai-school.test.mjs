import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../ai-school/index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../ai-school/ai-school.js', import.meta.url), 'utf8');
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');

assert.match(html, /<title>浅草・蔵前 AI仕事活用教室｜OfficeKit<\/title>/);
assert.match(html, /<link rel="canonical" href="https:\/\/office-kit\.jp\/ai-school\/">/);
assert.match(html, /name="description"/);
assert.match(html, /id="registration"/);
assert.equal((html.match(/class="[^"]*js-cta/g) || []).length >= 3, true);
assert.match(html, /2026年10月3日（土）10:00〜12:00/);
assert.match(html, /受付開始 9:45/);
assert.match(html, /<strong>8名<\/strong>/);
assert.match(html, /<del>4,980円（税込）<\/del>/);
assert.match(html, /<strong>2,980円（税込）<\/strong>/);
assert.match(html, /ルーク会議室/);
assert.match(html, /東京都台東区柳橋2-1-11/);
assert.doesNotMatch(html, /次回開催日は現在調整中|事前登録/);
assert.match(html, /"@type": "Event"/);
assert.match(html, /"startDate": "2026-10-03T10:00:00\+09:00"/);
assert.match(html, /"maximumAttendeeCapacity": 8/);
assert.match(html, /【OfficeKit】10\/3 AI仕事活用教室 参加申込/);
assert.match(html, /name="name"[^>]*required/);
assert.match(html, /name="email"[^>]*required/);
assert.match(html, /name="industry"[^>]*required/);
assert.match(html, /name="ai_experience"[^>]*required/);
assert.match(html, /name="problem"[^>]*required/);
assert.doesNotMatch(html, /name="interested_in_consultation"[^>]*required/);
assert.match(script, /if \(isSubmitting \|\| !form\.reportValidity\(\)\) return/);
assert.match(script, /submitButton\.disabled = true/);
assert.match(script, /ai_school_form_submit_complete/);
assert.match(script, /ai_school_apply_click/);
assert.match(home, /href="ai-school\/"/);

console.log('AI school static checks passed.');

