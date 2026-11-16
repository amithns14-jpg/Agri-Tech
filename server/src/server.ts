import { createApp } from './app.js';
import { env, validateRequiredEnv } from './config/env.js';

const app = createApp();

const status = validateRequiredEnv();
if (status.warnings.length > 0) {
  console.log('--------------------------------------------------');
  console.log('🌾 AgroGuide AI - Server Environment Notices:');
  status.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
  console.log('--------------------------------------------------');
}

app.listen(env.PORT, () => {
  console.log(`🚀 AgroGuide AI Server listening on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`📡 API Base: http://localhost:${env.PORT}/api/v1`);
  console.log(`🌐 Client Origin: ${env.CLIENT_URL}`);
  console.log(`🧠 AI Engine: ${env.GEMINI_MODEL} (${env.isGeminiConfigured ? 'Live Google GenAI' : 'Agro-Ecological Fallback'})`);
});

export default app;
