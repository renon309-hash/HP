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
assert.match(html, /name="name"[^>]*required/);
assert.match(html, /name="email"[^>]*required/);
assert.match(html, /name="industry"[^>]*required/);
assert.match(html, /name="ai_experience"[^>]*required/);
assert.match(html, /name="problem"[^>]*required/);
assert.match(html, /name="interested_in_consultation"[^>]*required/);
assert.match(script, /if \(isSubmitting \|\| !form\.reportValidity\(\)\) return/);
assert.match(script, /submitButton\.disabled = true/);
assert.match(script, /ai_school_form_submit_complete/);
assert.match(home, /href="ai-school\/"/);

console.log('AI school static checks passed.');

