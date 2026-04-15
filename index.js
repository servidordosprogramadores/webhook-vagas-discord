const { fetchLatestJob } = require('./src/api');
const { formatDiscordMessage } = require('./src/formatter');
const { sendToDiscord } = require('./src/sendWebhook');
require('dotenv').config();

const DISCORD_WEBHOOK_REGEX = /^https:\/\/discord\.com\/api\/webhooks\/[\w-]+\/[\w-]+$/;

// Intervalo de 5 minutos (5 * 60 * 1000 milissegundos)
const INTERVAL_MS = 5 * 60 * 1000;

// Configuração das rotas e webhooks
const TRACKERS = [
  { key: 'estagio', endpoint: '/estagio', envVar: 'ESTAGIO_WEBHOOK_URL', lastUrl: null },
  { key: 'junior', endpoint: '/junior', envVar: 'JUNIOR_WEBHOOK_URL', lastUrl: null },
  { key: 'pleno', endpoint: '/pleno', envVar: 'PLENO_WEBHOOK_URL', lastUrl: null },
  { key: 'senior', endpoint: '/senior', envVar: 'SENIOR_WEBHOOK_URL', lastUrl: null }
];

function getValidWebhookUrls(rawWebhookValue, trackerKey) {
  if (!rawWebhookValue || typeof rawWebhookValue !== 'string') {
    console.error(`[${trackerKey.toUpperCase()}] Webhook não configurado.`);
    return [];
  }

  const urls = rawWebhookValue
    .split(',')
    .map(url => url.trim())
    .filter(Boolean);

  if (urls.length === 0) {
    console.error(`[${trackerKey.toUpperCase()}] Nenhuma URL de webhook válida encontrada.`);
    return [];
  }

  const validUrls = urls.filter(url => DISCORD_WEBHOOK_REGEX.test(url));
  const invalidUrls = urls.filter(url => !DISCORD_WEBHOOK_REGEX.test(url));

  if (invalidUrls.length > 0) {
    console.error(`[${trackerKey.toUpperCase()}] URLs de webhook inválidas ignoradas: ${invalidUrls.join(', ')}`);
  }

  return validUrls;
}

function validateTrackerWebhooks() {
  for (const tracker of TRACKERS) {
    const validUrls = getValidWebhookUrls(process.env[tracker.envVar], tracker.key);

    if (validUrls.length === 0) {
      console.error(`[${tracker.key.toUpperCase()}] Nenhum webhook válido para ${tracker.envVar}.`);
      continue;
    }

    process.env[tracker.envVar] = validUrls.join(', ');
    console.log(`[${tracker.key.toUpperCase()}] ${validUrls.length} webhook(s) válido(s) configurado(s).`);
  }
}

async function run() {
  console.log('Iniciando ciclo de verificação de vagas...');

  for (const tracker of TRACKERS) {
    const jobData = await fetchLatestJob(tracker.endpoint);

    if (jobData) {
      if (jobData.link_vaga === tracker.lastUrl) {
        console.log(`[${tracker.key.toUpperCase()}] Nenhuma vaga nova (link repetido).`);
        continue;
      }

      console.log(`[${tracker.key.toUpperCase()}] Nova vaga encontrada: ${jobData.titulo_vaga}`);
      const payload = formatDiscordMessage(jobData);
      const validUrls = getValidWebhookUrls(process.env[tracker.envVar], tracker.key);

      if (validUrls.length > 0) {
        await sendToDiscord(validUrls.join(', '), payload);
        tracker.lastUrl = jobData.link_vaga;
      } else {
        console.error(`[${tracker.key.toUpperCase()}] Variável de ambiente ${tracker.envVar} sem webhooks válidos.`);
      }
    } else {
      console.log(`[${tracker.key.toUpperCase()}] Não foi possível obter dados da vaga.`);
    }
  }
}

// Executa imediatamente ao iniciar
validateTrackerWebhooks();
run();

// Configura o intervalo
setInterval(run, INTERVAL_MS);

console.log('Serviço de Bot de Vagas iniciado. Rodando a cada 5 minutos.');
