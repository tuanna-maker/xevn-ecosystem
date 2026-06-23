import { resolveHrmApiBaseUrl } from './resolve-hrm-api-base-url';

describe('resolveHrmApiBaseUrl UF-XBOS-09 catalog upstream', () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
    delete process.env.HRM_API_URL;
    delete process.env.XEVN_HRM_API_URL;
    delete process.env.DOCKER;
    delete process.env.HRM_BE_PORT;
    delete process.env.HRM_BE_CONTAINER_PORT;
  });

  afterAll(() => {
    process.env = env;
  });

  it('prefers explicit non-localhost HRM_API_URL', () => {
    process.env.HRM_API_URL = 'http://hrm-be:3001';
    expect(resolveHrmApiBaseUrl()).toBe('http://hrm-be:3001');
  });

  it('uses localhost host port outside docker', () => {
    process.env.HRM_BE_PORT = '28001';
    expect(resolveHrmApiBaseUrl()).toBe('http://127.0.0.1:28001');
  });

  it('uses docker service host when DOCKER=1', () => {
    process.env.DOCKER = '1';
    expect(resolveHrmApiBaseUrl()).toBe('http://hrm-be:3001');
  });
});
