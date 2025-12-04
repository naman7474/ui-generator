# Code Review & Production Readiness

## 1. Is the code good for production?

**Verdict: Partially.** It is suitable for internal tools, staging environments, or low-traffic services, but **not yet ready for a high-traffic public SaaS**.

### ✅ Strengths
- **Architecture**: Clean separation of concerns (Server, Comparator, Storage, Report).
- **Storage**: Good abstraction for storage with S3 support implemented. This is crucial for scalability.
- **Safety**: Sequential processing in batch mode prevents overwhelming the server or target site.
- **Validation**: Uses `zod` for robust input validation.
- **Cleanup**: Implements cleanup logic for both local and S3 storage.

### ⚠️ Weaknesses & Risks
- **Stateful Processing**: The server holds requests open while processing (`await runGate`). If a comparison takes 30s+, the HTTP connection might time out (especially on load balancers).
- **Concurrency**: `inFlightRuns` is in-memory. If you deploy 5 instances, you have 5 * `maxConcurrentRuns` capacity, but no global coordination.
- **Resource Intensity**: Playwright is heavy. Running it alongside the API server in the same container can lead to OOM (Out of Memory) kills.
- **Security**: No authentication. Anyone who finds the URL can trigger expensive comparisons or delete history (`/admin/cleanup`).
- **Temporary Storage**: It writes screenshots to local disk before uploading to S3. In serverless environments with limited `/tmp`, this could fail for large batches.

## 2. What else can be done? (Improvements)

### 🔒 Security
- **Authentication**: Add a simple API Key middleware or Basic Auth to protect `/compare` and `/admin` endpoints.
- **Rate Limiting**: Use Redis-based rate limiting instead of just in-memory concurrency gating.

### ⚡ Performance & Scalability
- **Asynchronous Processing**:
  - Instead of waiting for the result, return a `jobId` immediately.
  - Use a job queue (like BullMQ + Redis).
  - Create a separate "Worker" service that processes jobs.
  - Client polls `/status/:jobId` or uses a webhook.
- **Streaming**: Stream screenshots directly to S3 to avoid filling up local disk (requires more complex coding with `pixelmatch`).

### 🛠️ DevOps
- **Docker Optimization**: The current Dockerfile is decent but could be optimized (multi-stage builds to reduce size).
- **Observability**: Add structured logging (e.g., Pino) and metrics (Prometheus) to track comparison durations and error rates.

### 🧪 Testing
- **Unit Tests**: Add tests for `comparator.ts` logic (mocking Playwright).
- **Integration Tests**: Test the full flow against a dummy site.
