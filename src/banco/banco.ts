import * as SQLite from 'expo-sqlite';
import { ErroDoBanco } from '../erros/erros';
import type {
  Combustivel,
  Especialidade,
  Mecanico,
  OrdemServico,
  Prioridade,
  StatusOrdemServico,
  StatusVeiculo,
  TipoManutencao,
  Veiculo,
} from '../types';
import type { ContagemLocal, DadosLocais, DadosPendente, Pendente } from './tipos';

export type { ContagemLocal, DadosLocais, DadosPendente, Pendente } from './tipos';

interface LinhaVeiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  combustivel: Combustivel;
  quilometragem: number;
  proxima_revisao_km: number;
  status: StatusVeiculo;
}

interface LinhaMecanico {
  id: string;
  nome: string;
  telefone: string;
  especialidade: Especialidade;
  ativo: number;
}

interface LinhaOrdem {
  id: string;
  veiculo_id: string;
  mecanico_id: string;
  tipo: TipoManutencao;
  prioridade: Prioridade;
  descricao: string;
  custo_estimado: number;
  quilometragem_no_servico: number;
  status: StatusOrdemServico;
  data_abertura: string;
  data_conclusao: string | null;
  foto_url: string | null;
}

interface LinhaPendente {
  id: number;
  veiculo_id: string;
  mecanico_id: string;
  tipo: TipoManutencao;
  prioridade: Prioridade;
  descricao: string;
  custo_estimado: number;
  quilometragem_no_servico: number;
  foto_base64: string | null;
  foto_mime: 'image/jpeg' | 'image/png' | null;
}

let bancoAberto: Promise<SQLite.SQLiteDatabase> | undefined;

function banco(): Promise<SQLite.SQLiteDatabase> {
  if (bancoAberto === undefined) {
    bancoAberto = SQLite.openDatabaseAsync('frota.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS veiculos (
          id TEXT PRIMARY KEY NOT NULL,
          placa TEXT NOT NULL,
          marca TEXT NOT NULL,
          modelo TEXT NOT NULL,
          ano_fabricacao INTEGER NOT NULL,
          combustivel TEXT NOT NULL,
          quilometragem INTEGER NOT NULL,
          proxima_revisao_km INTEGER NOT NULL,
          status TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS mecanicos (
          id TEXT PRIMARY KEY NOT NULL,
          nome TEXT NOT NULL,
          telefone TEXT NOT NULL,
          especialidade TEXT NOT NULL,
          ativo INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS ordens (
          id TEXT PRIMARY KEY NOT NULL,
          veiculo_id TEXT NOT NULL,
          mecanico_id TEXT NOT NULL,
          tipo TEXT NOT NULL,
          prioridade TEXT NOT NULL,
          descricao TEXT NOT NULL,
          custo_estimado REAL NOT NULL,
          quilometragem_no_servico INTEGER NOT NULL,
          status TEXT NOT NULL,
          data_abertura TEXT NOT NULL,
          data_conclusao TEXT,
          foto_url TEXT
        );
        CREATE TABLE IF NOT EXISTS pendentes (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          veiculo_id TEXT NOT NULL,
          mecanico_id TEXT NOT NULL,
          tipo TEXT NOT NULL,
          prioridade TEXT NOT NULL,
          descricao TEXT NOT NULL,
          custo_estimado REAL NOT NULL,
          quilometragem_no_servico INTEGER NOT NULL,
          foto_base64 TEXT,
          foto_mime TEXT
        );
      `);
      return db;
    });
    bancoAberto.catch(() => {
      bancoAberto = undefined;
    });
  }
  return bancoAberto;
}

async function noBanco<T>(operacao: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  try {
    const db = await banco();
    return await operacao(db);
  } catch (erro: unknown) {
    throw new ErroDoBanco(erro instanceof Error ? erro.message : String(erro));
  }
}

function paraVeiculo(linha: LinhaVeiculo): Veiculo {
  return {
    id: linha.id,
    placa: linha.placa,
    marca: linha.marca,
    modelo: linha.modelo,
    anoFabricacao: linha.ano_fabricacao,
    combustivel: linha.combustivel,
    quilometragem: linha.quilometragem,
    proximaRevisaoKm: linha.proxima_revisao_km,
    status: linha.status,
  };
}

function paraMecanico(linha: LinhaMecanico): Mecanico {
  return {
    id: linha.id,
    nome: linha.nome,
    telefone: linha.telefone,
    especialidade: linha.especialidade,
    ativo: linha.ativo === 1,
  };
}

function paraOrdem(linha: LinhaOrdem): OrdemServico {
  return {
    id: linha.id,
    veiculoId: linha.veiculo_id,
    mecanicoId: linha.mecanico_id,
    tipo: linha.tipo,
    prioridade: linha.prioridade,
    descricao: linha.descricao,
    custoEstimado: linha.custo_estimado,
    quilometragemNoServico: linha.quilometragem_no_servico,
    status: linha.status,
    dataAbertura: linha.data_abertura,
    dataConclusao: linha.data_conclusao,
    fotoUrl: linha.foto_url,
  };
}

function paraPendente(linha: LinhaPendente): Pendente {
  return {
    id: linha.id,
    veiculoId: linha.veiculo_id,
    mecanicoId: linha.mecanico_id,
    tipo: linha.tipo,
    prioridade: linha.prioridade,
    descricao: linha.descricao,
    custoEstimado: linha.custo_estimado,
    quilometragemNoServico: linha.quilometragem_no_servico,
    fotoBase64: linha.foto_base64,
    fotoMime: linha.foto_mime,
  };
}

export function listarLocal(): Promise<DadosLocais> {
  return noBanco(async (db) => {
    const veiculos = await db.getAllAsync<LinhaVeiculo>('SELECT * FROM veiculos ORDER BY CAST(id AS INTEGER)');
    const mecanicos = await db.getAllAsync<LinhaMecanico>('SELECT * FROM mecanicos ORDER BY CAST(id AS INTEGER)');
    const ordens = await db.getAllAsync<LinhaOrdem>('SELECT * FROM ordens ORDER BY CAST(id AS INTEGER) DESC');
    return {
      veiculos: veiculos.map(paraVeiculo),
      mecanicos: mecanicos.map(paraMecanico),
      ordens: ordens.map(paraOrdem),
    };
  });
}

export function guardarLocal(dados: DadosLocais): Promise<void> {
  return noBanco((db) =>
    db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM veiculos');
      await db.runAsync('DELETE FROM mecanicos');
      await db.runAsync('DELETE FROM ordens');
      for (const veiculo of dados.veiculos) {
        await db.runAsync(
          'INSERT INTO veiculos (id, placa, marca, modelo, ano_fabricacao, combustivel, quilometragem, proxima_revisao_km, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            veiculo.id,
            veiculo.placa,
            veiculo.marca,
            veiculo.modelo,
            veiculo.anoFabricacao,
            veiculo.combustivel,
            veiculo.quilometragem,
            veiculo.proximaRevisaoKm,
            veiculo.status,
          ],
        );
      }
      for (const mecanico of dados.mecanicos) {
        await db.runAsync(
          'INSERT INTO mecanicos (id, nome, telefone, especialidade, ativo) VALUES (?, ?, ?, ?, ?)',
          [mecanico.id, mecanico.nome, mecanico.telefone, mecanico.especialidade, mecanico.ativo ? 1 : 0],
        );
      }
      for (const ordem of dados.ordens) {
        await db.runAsync(
          'INSERT INTO ordens (id, veiculo_id, mecanico_id, tipo, prioridade, descricao, custo_estimado, quilometragem_no_servico, status, data_abertura, data_conclusao, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            ordem.id,
            ordem.veiculoId,
            ordem.mecanicoId,
            ordem.tipo,
            ordem.prioridade,
            ordem.descricao,
            ordem.custoEstimado,
            ordem.quilometragemNoServico,
            ordem.status,
            ordem.dataAbertura,
            ordem.dataConclusao,
            ordem.fotoUrl,
          ],
        );
      }
    }),
  );
}

export function contarLocal(): Promise<ContagemLocal> {
  return noBanco(async (db) => {
    const linha = await db.getFirstAsync<ContagemLocal>(
      'SELECT (SELECT COUNT(*) FROM veiculos) AS veiculos, (SELECT COUNT(*) FROM mecanicos) AS mecanicos, (SELECT COUNT(*) FROM ordens) AS ordens',
    );
    return linha ?? { veiculos: 0, mecanicos: 0, ordens: 0 };
  });
}

export function listarPendentes(): Promise<Pendente[]> {
  return noBanco(async (db) => {
    const linhas = await db.getAllAsync<LinhaPendente>('SELECT * FROM pendentes ORDER BY id');
    return linhas.map(paraPendente);
  });
}

export function guardarPendente(dados: DadosPendente): Promise<Pendente> {
  return noBanco(async (db) => {
    const resultado = await db.runAsync(
      'INSERT INTO pendentes (veiculo_id, mecanico_id, tipo, prioridade, descricao, custo_estimado, quilometragem_no_servico, foto_base64, foto_mime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        dados.veiculoId,
        dados.mecanicoId,
        dados.tipo,
        dados.prioridade,
        dados.descricao,
        dados.custoEstimado,
        dados.quilometragemNoServico,
        dados.fotoBase64,
        dados.fotoMime,
      ],
    );
    return { id: resultado.lastInsertRowId, ...dados };
  });
}

export function removerPendente(id: number): Promise<void> {
  return noBanco(async (db) => {
    await db.runAsync('DELETE FROM pendentes WHERE id = ?', [id]);
  });
}
