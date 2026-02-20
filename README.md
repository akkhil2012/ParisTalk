# ParisTalk: Latency SLOs in the AI Era

## Overview

This repository accompanies the Paris talk on **Latency SLOs in the AI Era** — exploring how traditional latency Service Level Objectives (SLOs) must evolve to meet the unique demands of AI and machine-learning workloads.

## Why Latency SLOs Are Different in the AI Era

Traditional web services often have predictable, sub-100ms response times. AI inference workloads break several of these assumptions:

- **Non-deterministic latency**: Token streaming, sampling, and model size all introduce variance that simple p99 SLOs fail to capture.
- **Long-tail distributions**: A single slow generation can dominate user experience; median-only SLOs miss this.
- **Time-to-first-token (TTFT) vs. total generation time**: Users experience these very differently. Both need separate SLOs.
- **Throughput/latency trade-offs**: Batching requests improves GPU utilization but increases individual request latency.

## Key Concepts

### 1. Time-to-First-Token (TTFT)
The latency from request submission to the first token appearing in the response. This is the perceived "wait time" and should be tracked separately from overall generation duration.

**Recommended SLO**: `p95 TTFT ≤ 500ms`

### 2. Inter-Token Latency (ITL)
The time between successive tokens in a streamed response. High ITL creates a "stuttering" experience even if TTFT is good.

**Recommended SLO**: `p99 ITL ≤ 100ms per token`

### 3. Total Generation Time
End-to-end latency for complete responses. Relevant for batch/non-streaming use cases.

**Recommended SLO**: Define per use case (e.g., `p95 total latency ≤ 10s` for a typical RAG query)

### 4. Error Budget
Just like traditional SLOs, maintain an error budget. For AI services, "errors" include:
- Requests that exceed the TTFT SLO
- Requests that exceed the ITL SLO
- Requests that time out or return incomplete responses

## Measuring Latency in AI Systems

```python
import time

class LatencyTracker:
    def __init__(self):
        self.request_start = None
        self.first_token_time = None
        self.token_times = []

    def on_request_start(self):
        self.request_start = time.monotonic()

    def on_first_token(self):
        self.first_token_time = time.monotonic()
        self.token_times.append(self.first_token_time)

    def on_token(self):
        """Call for each token after the first (on_first_token handles the first token)."""
        self.token_times.append(time.monotonic())

    @property
    def ttft(self):
        if self.first_token_time and self.request_start:
            return self.first_token_time - self.request_start
        return None

    @property
    def inter_token_latencies(self):
        return [
            self.token_times[i] - self.token_times[i - 1]
            for i in range(1, len(self.token_times))
        ]
```

## Setting Meaningful AI Latency SLOs

| Metric | User-facing chat | Internal batch | RAG pipeline |
|--------|-----------------|----------------|--------------|
| TTFT p95 | ≤ 500ms | ≤ 5s | ≤ 1s |
| ITL p99 | ≤ 100ms | N/A | ≤ 200ms |
| Total p95 | ≤ 15s | ≤ 60s | ≤ 10s |

## Common Pitfalls

1. **Using only p50 or average**: AI latency distributions are heavily skewed — always measure p95/p99.
2. **Ignoring TTFT**: Users notice wait time before streaming begins more acutely than overall generation time.
3. **Not separating model inference from network overhead**: Instrument both individually to pinpoint bottlenecks.
4. **Static SLOs for dynamic workloads**: As models scale or prompts grow, SLOs should be revisited regularly.

## Resources

- [SRE Workbook — SLOs](https://sre.google/workbook/implementing-slos/)
- [OpenTelemetry GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [LLM Observability Best Practices](https://opentelemetry.io/blog/)
