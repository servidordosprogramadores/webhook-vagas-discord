function formatDiscordMessage(jobData) {
  if (!jobData) return null;

  const technologies = Array.isArray(jobData.tecnologias)
    ? jobData.tecnologias.join(', ')
    : (jobData.tecnologias || 'Não informadas');

  let requirementsText = 'Não informado';
  if (Array.isArray(jobData.requisitos_desejaveis)) {
    requirementsText = jobData.requisitos_tecnicos.map(req => `- ${req}`).join('\n');
  } else if (typeof jobData.requisitos_desejaveis === 'string') {
    const items = jobData.requisitos_tecnicos.split(';').map(item => item.trim()).filter(item => item);

    if (items.length > 0) {
      requirementsText = items.map((req, index) => {
        const punctuation = index === items.length - 1 ? '.' : ';';
        return `- ${req}${punctuation}`;
      }).join('\n');
    }
  }

  const components = [
    {
      "type": 17,
      "accent_color": 1722367,
      "spoiler": false,
      "components": [
        {
          "type": 10,
          "content": `## ${jobData.titulo_vaga}`
        },
        {
          "type": 10,
          "content": `**Nível**: ${jobData.nivel_vaga || 'Não informado'}`
        },
        {
          "type": 10,
          "content": `**Descrição**: ${jobData.descricao_vaga || 'Sem descrição'}`
        },
        {
          "type": 10,
          "content": `**Requisitos**:\n${requirementsText}`
        },
        {
          "type": 10,
          "content": `**Tecnologias**: ${technologies}.`
        },
        {
          "type": 10,
          "content": `**Salário**: ${jobData.salario || 'A combinar'}`
        },
        {
          "type": 10,
          "content": `**Modelo**: ${jobData.forma_trabalho || 'Não informado'}`
        },
        {
          "type": 10,
          "content": `**Local**: ${jobData.local || 'Não informado'}`
        },
        {
          "type": 10,
          "content": `-# Essa vaga foi retirada do site [meupadrinho.com.br](https://meupadrinho.com.br).` // Mudar isso dps
        }
      ]
    },
    {
      "type": 14,
      "divider": true,
      "spacing": 1
    },
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 5,
          "label": "Candidatar-se",
          "emoji": null,
          "disabled": false,
          "url": jobData.link_vaga
        }
      ]
    }
  ];

  const companyLink = jobData.link_pagina_linkedin || jobData.link_empresa;
  if (companyLink) {
    components[2].components.push({
      "type": 2,
      "style": 5,
      "label": `Empresa ${jobData.nome_empresa || ''}`,
      "emoji": null,
      "disabled": false,
      "url": companyLink
    });
  }

  return {
    components: components,
    flags: 32768
  };
}

module.exports = { formatDiscordMessage };
