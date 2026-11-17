/**
 * Pruebas de seguridad del backend Express (autenticación, RBAC y multi-tenancy).
 * Corren sin MongoDB: usan el almacenamiento en memoria con datos sintéticos.
 *   npm test
 */
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { DEFAULT_DEMO_PASSWORD } from '../src/auth/demoUsers.js';

let server: Server;
let base = '';

const ALPHA_EXAM = 'mem-eval-kine-1'; // clinic-alpha, patient-001
const BETA_EXAM = 'mem-beta-1'; // clinic-beta, patient-101

before(async () => {
  delete process.env.DEMO_PASSWORD;
  server = createApp().listen(0);
  await new Promise<void>((r) => server.once('listening', () => r()));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => new Promise<void>((r) => server.close(() => r())));

async function call(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

async function login(username: string): Promise<string> {
  const r = await call('POST', '/api/auth/login', undefined, { username, password: DEFAULT_DEMO_PASSWORD });
  assert.equal(r.status, 200, `login ${username}`);
  return r.json.token;
}

describe('autenticación', () => {
  test('login con contraseña incorrecta -> 401', async () => {
    const r = await call('POST', '/api/auth/login', undefined, { username: 'paciente.alpha', password: 'x' });
    assert.equal(r.status, 401);
  });

  test('login correcto devuelve JWT con user_id, role y client_id', async () => {
    const token = await login('clinico.beta');
    const claims = jwt.decode(token) as Record<string, unknown>;
    assert.equal(claims.user_id, 'clinician-101');
    assert.equal(claims.role, 'clinician');
    assert.equal(claims.client_id, 'clinic-beta');
  });

  test('todas las rutas de /api/exams rechazan sin token (401)', async () => {
    const routes: [string, string][] = [
      ['GET', '/api/exams'],
      ['GET', '/api/exams/demo-pdf'],
      ['GET', `/api/exams/${ALPHA_EXAM}`],
      ['GET', `/api/exams/${ALPHA_EXAM}/file`],
      ['POST', '/api/exams/upload'],
      ['POST', `/api/exams/${ALPHA_EXAM}/range-review`],
      ['PATCH', `/api/exams/${ALPHA_EXAM}/confirm`],
      ['PATCH', `/api/exams/${ALPHA_EXAM}/validate`],
    ];
    for (const [m, p] of routes) {
      const r = await call(m, p, undefined, m === 'GET' ? undefined : {});
      assert.equal(r.status, 401, `${m} ${p}`);
    }
  });

  test('token firmado con otro secreto o con tenant alterado -> 401', async () => {
    const forged = jwt.sign({ user_id: 'clinician-001', role: 'clinician', client_id: 'clinic-alpha' }, 'otro-secreto', {
      issuer: 'wellq-demo',
    });
    assert.equal((await call('GET', '/api/exams', forged)).status, 401);

    // Cambiar el client_id del payload sin re-firmar invalida la firma.
    const real = await login('paciente.beta');
    const [h, , sig] = real.split('.');
    const payload = Buffer.from(
      JSON.stringify({ ...(jwt.decode(real) as object), client_id: 'clinic-alpha' })
    ).toString('base64url');
    assert.equal((await call('GET', '/api/exams', `${h}.${payload}.${sig}`)).status, 401);
  });
});

describe('multi-tenancy: cliente A no puede acceder a datos del cliente B', () => {
  test('listar: beta solo ve beta, aunque mande ?client_id=clinic-alpha', async () => {
    const token = await login('clinico.beta');
    const r = await call('GET', '/api/exams?client_id=clinic-alpha', token);
    assert.equal(r.status, 200);
    assert.ok(r.json.data.length > 0);
    assert.ok(r.json.data.every((e: any) => e.client_id === 'clinic-beta'));
  });

  test('leer examen y archivo de otro tenant -> 404 (en ambos sentidos)', async () => {
    const beta = await login('clinico.beta');
    const alpha = await login('clinico.alpha');
    assert.equal((await call('GET', `/api/exams/${ALPHA_EXAM}`, beta)).status, 404);
    assert.equal((await call('GET', `/api/exams/${ALPHA_EXAM}/file`, beta)).status, 404);
    assert.equal((await call('GET', `/api/exams/${BETA_EXAM}`, alpha)).status, 404);
    assert.equal((await call('GET', `/api/exams/${BETA_EXAM}/file`, alpha)).status, 404);
    // Control positivo: el propio tenant sí accede.
    assert.equal((await call('GET', `/api/exams/${ALPHA_EXAM}`, alpha)).status, 200);
  });

  test('modificar examen de otro tenant -> 404 y el examen no cambia', async () => {
    const beta = await login('clinico.beta');
    const alpha = await login('clinico.alpha');
    const before = (await call('GET', `/api/exams/${ALPHA_EXAM}`, alpha)).json.data;

    assert.equal((await call('PATCH', `/api/exams/${ALPHA_EXAM}/validate`, beta, { decision: 'validate' })).status, 404);
    assert.equal((await call('POST', `/api/exams/${ALPHA_EXAM}/range-review`, beta, {})).status, 404);
    const patientBeta = await login('paciente.beta');
    assert.equal((await call('PATCH', `/api/exams/${ALPHA_EXAM}/confirm`, patientBeta, {})).status, 404);

    const after = (await call('GET', `/api/exams/${ALPHA_EXAM}`, alpha)).json.data;
    assert.equal(after.status, before.status);
    assert.equal(after.revision, before.revision);
  });

  test('subir: client_id y patient_id del body se ignoran, se usan los del JWT', async () => {
    const token = await login('paciente.beta');
    const r = await call('POST', '/api/exams/upload', token, {
      client_id: 'clinic-alpha',
      patient_id: 'patient-001',
      filename: 'prueba-sintetica.pdf',
      content_type: 'application/pdf',
      file_data: 'data:application/pdf;base64,JVBERi0xLjQK',
    });
    assert.equal(r.status, 201);
    assert.equal(r.json.data.client_id, 'clinic-beta');
    assert.equal(r.json.data.patient_id, 'patient-101');
    const alpha = await login('clinico.alpha');
    assert.equal((await call('GET', `/api/exams/${r.json.data._id}`, alpha)).status, 404);
  });
});

describe('RBAC', () => {
  test('paciente no puede validar (403)', async () => {
    const t = await login('paciente.alpha');
    assert.equal((await call('PATCH', `/api/exams/${ALPHA_EXAM}/validate`, t, { decision: 'validate' })).status, 403);
  });

  test('clínico no puede confirmar como paciente ni subir (403)', async () => {
    const t = await login('clinico.alpha');
    assert.equal((await call('PATCH', `/api/exams/${ALPHA_EXAM}/confirm`, t, {})).status, 403);
    assert.equal((await call('POST', '/api/exams/upload', t, {})).status, 403);
  });

  test('flujo demo: paciente confirma su examen y clínico lo valida; actor sale del token', async () => {
    const p = await login('paciente.alpha');
    const c = await login('clinico.alpha');
    const conf = await call('PATCH', `/api/exams/${ALPHA_EXAM}/confirm`, p, { actor: 'suplantado', reason: '' });
    assert.equal(conf.status, 200);
    assert.equal(conf.json.data.status, 'confirmed_by_patient');
    assert.equal(conf.json.data.confirmed_by, 'patient-001');

    const val = await call('PATCH', `/api/exams/${ALPHA_EXAM}/validate`, c, { actor: 'suplantado', decision: 'validate' });
    assert.equal(val.status, 200);
    assert.equal(val.json.data.status, 'clinically_validated');
    assert.equal(val.json.data.validated_by, 'clinician-001');
  });
});

describe('auditoría separada (audit_events)', () => {
  test('un intento cruzado queda registrado con las cinco dimensiones y resultado denied', async () => {
    const { readMemoryAudit } = await import('../src/audit/auditLog.js');
    const token = await login('clinico.beta');
    await call('GET', `/api/exams/${ALPHA_EXAM}`, token);
    // La entrada se escribe al terminar la respuesta: esperar un tick.
    await new Promise((r) => setTimeout(r, 20));
    const entry = readMemoryAudit()
      .filter((e) => e.action === 'exam_read' && e.resource_id === ALPHA_EXAM && e.actor_id === 'clinician-101')
      .at(-1);
    assert.ok(entry, 'debe existir la entrada');
    assert.equal(entry.actor_role, 'clinician'); // quién
    assert.equal(entry.client_id, 'clinic-beta'); // desde dónde (tenant)
    assert.ok(entry.ip); // desde dónde (red)
    assert.ok(!Number.isNaN(Date.parse(entry.timestamp))); // cuándo
    assert.equal(entry.outcome, 'denied'); // resultado
    assert.equal(entry.status_code, 404);
    assert.ok(Object.isFrozen(entry), 'la entrada no se puede modificar');
  });

  test('login fallido se audita sin guardar la contraseña', async () => {
    const { readMemoryAudit } = await import('../src/audit/auditLog.js');
    await call('POST', '/api/auth/login', undefined, { username: 'nadie', password: 'secreto-xyz' });
    await new Promise((r) => setTimeout(r, 20));
    const entry = readMemoryAudit().filter((e) => e.action === 'auth_login').at(-1)!;
    assert.equal(entry.outcome, 'denied');
    assert.equal(entry.actor_id, 'attempt:nadie');
    assert.ok(!JSON.stringify(readMemoryAudit()).includes('secreto-xyz'));
  });
});
