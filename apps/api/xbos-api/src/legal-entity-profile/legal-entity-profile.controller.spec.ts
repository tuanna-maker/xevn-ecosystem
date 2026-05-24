import type { Response } from 'express';
import { LegalEntityProfileController } from './legal-entity-profile.controller';
import type { LegalEntityProfileService } from './legal-entity-profile.service';

describe('LegalEntityProfileController', () => {
  function createController() {
    const stream = {
      pipe: jest.fn(),
    };
    const service = {
      streamDocumentFile: jest.fn(async () => ({
        stream,
        mimeType: 'application/pdf',
        fileName: 'dang-ky-kinh-doanh.pdf',
      })),
    };
    const response = {
      setHeader: jest.fn(),
    } as unknown as Response;

    return {
      controller: new LegalEntityProfileController(service as unknown as LegalEntityProfileService),
      service,
      response,
      stream,
    };
  }

  it('rejects direct legal document file requests without internal auth', async () => {
    const { controller, service, response } = createController();

    await expect(
      controller.streamFile('74f9d798-e4c4-44c5-a087-ad6d4a611f4d', 'xevn', 'holding', undefined, undefined, response),
    ).rejects.toMatchObject({ code: 'XBOS-AUTH-001' });

    expect(service.streamDocumentFile).not.toHaveBeenCalled();
  });

  it('passes resolved tenant and company scope to the stream service', async () => {
    const { controller, service, response, stream } = createController();

    await controller.streamFile(
      '74f9d798-e4c4-44c5-a087-ad6d4a611f4d',
      'xevn',
      'holding',
      undefined,
      'xevn-dev-internal-key',
      response,
    );

    expect(service.streamDocumentFile).toHaveBeenCalledWith(
      'xevn',
      'holding',
      '74f9d798-e4c4-44c5-a087-ad6d4a611f4d',
    );
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(stream.pipe).toHaveBeenCalledWith(response);
  });
});
