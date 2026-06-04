let tracingStarted = false;

export async function startPlatformTracing(service: string): Promise<void> {
  if (tracingStarted) return;
  if (process.env.OTEL_ENABLED !== 'true') return;

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim() || 'http://127.0.0.1:4318/v1/traces';
  const sampleRatio = Number(process.env.OTEL_TRACE_SAMPLE_RATIO ?? '1');

  const { NodeSDK } = await import('@opentelemetry/sdk-node');
  const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
  const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
  const { Resource } = await import('@opentelemetry/resources');
  const { ATTR_SERVICE_NAME } = await import('@opentelemetry/semantic-conventions');

  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: service,
    }),
    traceExporter: new OTLPTraceExporter({ url: endpoint }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
    sampler: sampleRatio < 1 ? undefined : undefined,
  });

  await sdk.start();
  tracingStarted = true;
  console.log(`[${service}] OpenTelemetry tracing enabled → ${endpoint} (sample=${sampleRatio})`);
}
