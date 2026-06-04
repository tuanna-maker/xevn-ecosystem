import { BadRequestException, HttpStatus } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './http-exception.filter';

describe('GlobalHttpExceptionFilter', () => {
  const filter = new GlobalHttpExceptionFilter();

  function mockHost() {
    const json = jest.fn();
    const setHeader = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status, setHeader };
    const request = {
      method: 'PUT',
      url: '/api/xbos/org-foundation/legal-entities/x',
      log: { warn: jest.fn(), error: jest.fn() },
    };
    return {
      host: {
        switchToHttp: () => ({
          getResponse: () => response,
          getRequest: () => request,
        }),
      },
      json,
      status,
    };
  }

  it('does not throw when HttpException response payload is undefined', () => {
    class PayloadUndefinedException extends BadRequestException {
      getResponse(): string | object {
        return undefined as unknown as string;
      }
    }
    const { host, json, status } = mockHost();
    expect(() => filter.catch(new PayloadUndefinedException(), host as never)).not.toThrow();
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'XBOS-VAL-001', success: false }),
    );
  });

  it('maps validation errors without custom code to XBOS-VAL-001', () => {
    const { host, json } = mockHost();
    filter.catch(new BadRequestException({ message: ['code must be a string'] }), host as never);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'XBOS-VAL-001', message: 'code must be a string' }),
    );
  });
});
