import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// On Cloud Run: set GOOGLE_CLOUD_PROJECT env var in Cloud Run service config.
// Credentials are picked up automatically from Workload Identity — no key file needed.
// Locally: set USE_CLOUD_TRACE=false (default) to use local OTLP collector.
const useCloudTrace =
  process.env.USE_CLOUD_TRACE === 'true' || process.env.K_SERVICE !== undefined; // K_SERVICE is set automatically on Cloud Run

if (process.env.OTEL_DEBUG === 'true') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

const serviceName = process.env.OTEL_SERVICE_NAME || 'gympal-backend';

const traceExporter = useCloudTrace
  ? new TraceExporter()
  : new OTLPTraceExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
        'http://localhost:4318/v1/traces',
    });

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  }) as any,

  traceExporter: traceExporter as any,
  instrumentations: [
    getNodeAutoInstrumentations({
      // fs instrumentation generates thousands of spans for every file read — useless noise
      '@opentelemetry/instrumentation-fs': { enabled: false },
      // dns spans are low-value for application tracing
      '@opentelemetry/instrumentation-dns': { enabled: false },
      // net spans are too low-level
      '@opentelemetry/instrumentation-net': { enabled: false },
    }),
    new PrismaInstrumentation(),
  ],
});

try {
  sdk.start();
  if (process.env.OTEL_DEBUG === 'true') {
    diag.info('OTel SDK started');
  }
} catch (err: unknown) {
  console.error('OTel SDK start failed', err);
}

process.on('SIGTERM', () => {
  void sdk.shutdown().finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  void sdk.shutdown().finally(() => process.exit(0));
});
