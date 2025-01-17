const delay = require("../utils/delay");
const selectBuddyPass = require("./selectBuddyPass");

const tryConfirming = async (page, mountain, date, retries, useBuddyPass) => {
  await delay(500);
  const saveBtn = await page.$x(`//span[contains(., 'Save')]`);
  if (saveBtn.length === 0) {
    console.log("No Save button - day not available");
    return false;
  } else {
    try {
      console.log("Confirming");

      const saveBtnParent = (await saveBtn[0].$x(".."))[0];
      if (saveBtnParent) {
        if (useBuddyPass === "yes") {
          selectBuddyPass(page);
        }
      }

      const confirm = await page.$x(`//span[contains(., 'Continue to Confirm')]`);
      if (confirm) {
        const confirmBtnParent = (await confirm[0].$x(".."))[0];
        if (confirmBtnParent) {
          await confirmBtnParent.click();
          await delay(1000);

          console.log("Review and Confirm");
          const agreeInputLabel = await page.$(".amp-checkbox-input");
          const agreeInputParent = (await agreeInputLabel.$x(".."))[0];
          await agreeInputParent.click();

          const confirmFinal = await page.$x(`//span[contains(., 'Confirm Reservations')]`);
          const confirmFinalBtnParent = (await confirmFinal[0].$x(".."))[0];
          await confirmFinalBtnParent.click();

          return true;
        } else {
          return false;
        }
      }
    } catch (e) {
      throw new Error("Error thrown confirming day " + e);
    }
  }
};

module.exports = tryConfirming;
