import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173/login');
  
  // type in username and password
  await page.type('input[type="email"]', 'member1@taskme.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Navigated to dashboard');
  
  // go to marketplace
  await page.goto('http://localhost:5173/dashboard/officials-marketplace', { waitUntil: 'networkidle0' });
  
  // go to communication
  await page.goto('http://localhost:5173/dashboard/officials-communication', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
