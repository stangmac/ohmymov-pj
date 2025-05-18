// recommendLoop.js
const { spawn } = require('child_process');

function runRecommendScript() {
  console.log("🚀 เริ่มรัน recommend.py...");

  const process = spawn('python', ['python/recommend.py'], {
    windowsHide: true, // ✅ ซ่อนหน้าต่างดำๆ (Windows เท่านั้น)
  });

  process.stdout.on('data', (data) => {
    console.log(`✅ stdout:\n${data.toString()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`⚠️ stderr:\n${data.toString()}`);
  });

  process.on('close', (code) => {
    console.log(`🛑 process exited with code ${code}`);
    console.log("♻️ รอ 10 วินาที แล้วรันใหม่...\n");
    setTimeout(runRecommendScript, 10000); // รันใหม่ทุก 10 วินาที
  });
}

// เริ่มต้นลูป
runRecommendScript();
