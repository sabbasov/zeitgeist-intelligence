# Manual Migration Option

Since the direct connection isn't working, you can run the migrations manually using Supabase's SQL Editor:

## Steps:

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the contents of `src/db/schema.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Cmd+Enter)

This will create all the tables directly in Supabase.

## After Running Manual Migration:

Once the tables are created, you can:
1. Start your backend: `npm run dev`
2. The API will work with the Supabase client approach
3. We can update the code to use Supabase client instead of direct PostgreSQL
