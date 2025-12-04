# Verification Guide

## 1. Setup Supabase

To enable the new features, you need to set up a Supabase project.

### A. Create Project & Get Credentials
1.  Go to [Supabase Dashboard](https://supabase.com/dashboard).
2.  Create a new project.
3.  Go to **Project Settings > API**.
4.  Copy the **Project URL** and **anon public key**.
5.  (Optional) For backend admin access, copy the **service_role secret**.

### B. Create Database Table
Run the following SQL in the **SQL Editor** of your Supabase project:

```sql
create table runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text not null, -- 'single' or 'batch'
  status text not null,
  base_url text not null,
  target_url text not null,
  summary jsonb,
  artifacts_path text
);

-- Enable Row Level Security (RLS)
alter table runs enable row level security;

-- Allow anyone to read runs (or restrict to authenticated users)
create policy "Public runs are viewable"
  on runs for select
  using ( true );

-- Allow authenticated users (or service role) to insert runs
create policy "Authenticated users can insert runs"
  on runs for insert
  with check ( auth.role() = 'authenticated' OR auth.role() = 'service_role' );
```

### C. Create Storage Bucket
1.  Go to **Storage**.
2.  Create a new bucket named `artifacts`.
3.  Make it **Public** (if you want reports to be viewable easily) or Private (requires signed URLs, which the code handles).
4.  Add a policy to allow upload/read.

### D. Configure Environment
Create or update your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-or-service-role-key
SUPABASE_BUCKET=artifacts
```

> [!TIP]
> If you use the **Service Role Key** as `SUPABASE_KEY`, the backend will have full admin access (bypassing RLS), which is easiest for an internal tool.

## 2. Verify UI & Multi-Device

1.  Start the server: `npm run dev`
2.  Open `http://localhost:3000`.
3.  **Verify UI**: The "Advanced Settings" should be hidden by default. No login modal should appear.
4.  **Verify Multi-Device**:
    -   Enter Base and Target URLs.
    -   Check both **Desktop** and **Mobile**.
    -   Run comparison.
    -   **Verify**: You should see TWO result cards (one for Desktop, one for Mobile).

## 3. Verify Path Filtering (Batch Mode)

1.  Check **Crawl multiple pages**.
2.  Enter a **Base URL** (e.g., `https://example.com`).
3.  In **Include Paths**, enter a pattern like `/blog/*`.
4.  Run the comparison.
5.  **Verify**: The output should only show pages matching `/blog/*`.

## 4. Verify Supabase Integration

1.  Ensure `.env` is configured.
2.  Run a comparison.
3.  Check your Supabase Dashboard:
    -   **Table Editor > runs**: You should see a new row.
    -   **Storage > artifacts**: You should see a new folder with screenshots.
4.  Refresh the app. The **History** section should load data from Supabase.
