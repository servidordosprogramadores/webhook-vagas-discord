const axios = require('axios');

const BASE_URL = 'https://vagas.audibert.dev';

async function fetchLatestJob(endpoint) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar vaga em ${endpoint}:`, error.message);
    return null;
  }
}

module.exports = { fetchLatestJob };