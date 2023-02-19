#!/usr/bin/env ts-node

import jsdom from 'jsdom';

async function main() {
  const url = process.argv[2];
  const response = await fetch(url);
  const body = await response.text();
  const dom = new jsdom.JSDOM(body);

  const elements = dom.window.document.querySelectorAll('link[type="application/rss+xml"]');

  for (const element of elements) {
    console.log(element.title, element.href);
  }
}

void main();
