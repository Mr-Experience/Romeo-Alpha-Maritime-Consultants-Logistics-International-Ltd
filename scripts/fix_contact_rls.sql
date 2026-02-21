-- FIX: Allow both anonymous and authenticated users to send messages

-- 1. Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow public to insert messages" ON public.contact_messages;

-- 2. Create a new inclusive policy for INSERT
CREATE POLICY "Allow everyone to insert messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

-- 3. Ensure other policies are correct (optional safety check)
-- These should already exist, but good to double-check
DROP POLICY IF EXISTS "Allow authenticated users to view messages" ON public.contact_messages;
CREATE POLICY "Allow authenticated users to view messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated 
USING (true);
