// src/services/flow.service.js

function screenResponse(screen, data = {}, version = '3.0') {
  return { version: version || '3.0', screen, data };
}

function toStr(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Alguns payloads chegam como:
 * data: { data: {...} }
 * (ex.: flow_action_payload: { data: {...} })
 * O controller já trata isso, mas deixo aqui também como "cinto e suspensório"
 */
function unwrapData(input) {
  if (!input || typeof input !== 'object') return {};
  if (input.data && typeof input.data === 'object' && !Array.isArray(input.data)) {
    return input.data;
  }
  return input;
}

function normalizeState(data = {}) {
  const d = unwrapData(data);

  return {
    protocolo: toStr(d.protocolo),
    cpf: toStr(d.cpf),
    nome: toStr(d.nome),
    family_code: toStr(d.family_code),
    telefone_principal: toStr(d.telefone_principal),
    cep: toStr(d.cep),
    logradouro: toStr(d.logradouro),
    bairro: toStr(d.bairro),
    cidade: toStr(d.cidade),
    uf: toStr(d.uf),
    complemento: toStr(d.complemento),
    dados_corretos: toStr(d.dados_corretos)
  };
}

export async function handleFlowStep({ screen, data, version }) {
  const v = version || '3.0';
  const state = normalizeState(data);

  switch (screen) {
    case 'INIT': {
      // Tela inicial do flow: devolve a primeira screen com os dados já preenchidos
      return screenResponse(
        'TESTE_DADOS',
        {
          protocolo: state.protocolo,
          cpf: state.cpf,
          nome: state.nome,
          family_code: state.family_code,
          telefone_principal: state.telefone_principal,
          cep: state.cep,
          logradouro: state.logradouro,
          bairro: state.bairro,
          cidade: state.cidade,
          uf: state.uf,
          complemento: state.complemento
        },
        v
      );
    }

    case 'TESTE_DADOS': {
      const resposta = toStr(state.dados_corretos).toLowerCase();

      if (!resposta) {
        return screenResponse(
          'RESULTADO',
          {
            status: 'erro',
            protocolo: state.protocolo,
            cpf: state.cpf,
            nome: state.nome,
            dados_corretos: '',
            mensagem_resultado: 'Nenhuma opção foi selecionada.'
          },
          v
        );
      }

      if (resposta === 'sim') {
        return screenResponse(
          'RESULTADO',
          {
            status: 'ok',
            protocolo: state.protocolo,
            cpf: state.cpf,
            nome: state.nome,
            dados_corretos: 'sim',
            mensagem_resultado: 'Dados confirmados com sucesso.'
          },
          v
        );
      }

      if (resposta === 'nao') {
        return screenResponse(
          'RESULTADO',
          {
            status: 'revisar',
            protocolo: state.protocolo,
            cpf: state.cpf,
            nome: state.nome,
            dados_corretos: 'nao',
            mensagem_resultado: 'Usuário informou que os dados não estão corretos.'
          },
          v
        );
      }

      return screenResponse(
        'RESULTADO',
        {
          status: 'erro',
          protocolo: state.protocolo,
          cpf: state.cpf,
          nome: state.nome,
          dados_corretos: resposta,
          mensagem_resultado: 'Valor inválido para dados_corretos.'
        },
        v
      );
    }

    default:
      return screenResponse(
        'RESULTADO',
        {
          status: 'erro',
          protocolo: state.protocolo,
          cpf: state.cpf,
          nome: state.nome,
          dados_corretos: state.dados_corretos,
          mensagem_resultado: `Screen ${screen} não suportada.`
        },
        v
      );
  }
}