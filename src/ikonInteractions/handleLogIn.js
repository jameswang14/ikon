const delay = require("../utils/delay");

const logInToIkon = async (page, logInInfo) => {
  // navigate to ikon
  await page.goto("https://account.ikonpass.com/en/login", {
    timeout: 180000, //180 seconds
  });

  await page.waitForSelector("#sign-in-password", { visible: true, timeout: 0 });

  console.log("logging in");
  const emailInput = await page.$("#email");
  await emailInput.type(logInInfo.email);
  const passwordInput = await page.$("#sign-in-password");
  await passwordInput.type(logInInfo.password);
  // console.log(passwordInput, "passwordInput");

  const submitBtn = await page.$(".submit");

  await Promise.all([
    page.waitForNavigation({
      waitUntil: ["networkidle0", "domcontentloaded"],
    }),
    submitBtn.click(),
  ]);
};

const checkSessionExpired = async (page, logInInfo) => {
  // check if session expired
  const sessionExpired = await page.$x(`//h1[contains(., 'Log in')]`);
  if (sessionExpired.length > 0) {
    console.log("Session Expired! Logging in again");
    // close the modal first, then login
    await delay(500);
    await logInToIkon(page, logInInfo);
  }
};

module.exports = { checkSessionExpired, logInToIkon };
