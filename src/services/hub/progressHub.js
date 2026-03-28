function buildProgress(progress = 0) {
  let percent = Number(progress) || 0;

  if (percent >= 100) percent = 100;
  else if (percent >= 75) percent = 75;
  else if (percent >= 60) percent = 60;
  else if (percent >= 45) percent = 45;
  else if (percent >= 30) percent = 30;
  else if (percent >= 15) percent = 15;
  else percent = 0;

  const steps = [
    "Onboarding",
    "Documents ready",
    "Digital signature",
    "Payment",
    "Preparer assigned",
    "Appointment",
    "Case closed",
  ];

  const completedCount =
    percent === 100 ? 7 :
    percent >= 90 ? 6 :
    percent >= 75 ? 4 :
    percent >= 60 ? 3 :
    percent >= 45 ? 2 :
    percent >= 30 ? 2 :
    percent >= 15 ? 1 : 0;

  let output = `📊 Progress: ${percent}% Completed\n\n`;

  steps.forEach((step, i) => {
    if (i < completedCount) {
      output += `✅ ${step}\n`;
    } else if (i === completedCount) {
      output += `🚀 ${step}\n`;
    } else {
      output += `❌ ${step}\n`;
    }
  });

  return output;
}

module.exports = {
  buildProgress,
};
