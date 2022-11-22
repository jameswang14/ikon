const loginUtils = require("./handleLogin");
const tryConfirming = require("./tryConfirming");
const delay = require("../utils/delay");
const chooseMountainToReserve = require("./mountainSelect");
const dateSelect = require("./dateSelect");
const moment = require("moment");

const FIVE_MINUTES = 1000 * 60 * 5;
const waitFiveMinutesAndRetry = async (page, mountain, dates, retries, logInInfo, buddy) => {
  console.log(`Retrying at ${moment().add(5, "minutes").format("h:mm:ss a")}`);
  await delay(FIVE_MINUTES); // wait five minutes;

  await page.reload({
    waitUntil: ["networkidle0", "domcontentloaded"],
  });

  await loginUtils.checkSessionExpired(page, logInInfo);
  await runWithRetries(page, mountain, dates, retries - 1, logInInfo, buddy);
};

const runWithRetries = async (page, mountain, dates, retries, logInInfo, buddy) => {
  if (dates.length === 0) {
    return true;
  }
  await chooseMountainToReserve(page, mountain);
  await delay(500);

  let toRemove = [];
  console.log(dates);
  for (const date of dates) {
    console.log(`trying ${date.month} ${date.day}`);
    try {
      let success = await dateSelect.findMonth(page, date);
      if (!success) {
        await waitFiveMinutesAndRetry(page, mountain, date, retries, logInInfo, buddy);
      }

      await dateSelect.selectDay(page, date);
      await delay(500);
      const spotReserved = await tryConfirming(page, mountain, date, retries, buddy);

      if (spotReserved) {
        console.log(`Space reserved for ${date.month} ${date.day} ${date.year}!!`);
        toRemove.push(date);
        // return true;
      } else if (retries > 0) {
        console.log(`date ${date.month} ${date.day} not available`);
        await delay(1000 * 5);
      } else {
        console.log("Exhausted retries");
        return false;
      }
    } catch (e) {
      console.log(e);
      if (retries > 0) {
        console.log(`Waiting five minutes and retying - Retries left: ${retries}`);
        console.log("******************************");
        await waitFiveMinutesAndRetry(page, mountain, dates, retries, logInInfo, buddy);
      } else {
        return false;
      }
    }
  }
  console.log(`Waiting and Retrying - retries left: ${retries}`);
  dates = dates.filter((date) => !toRemove.includes(date));
  await waitFiveMinutesAndRetry(page, mountain, dates, retries, logInInfo, buddy);
};

module.exports = runWithRetries;
