-- Create security definer function to get user's team IDs without recursion
CREATE OR REPLACE FUNCTION public.get_user_team_ids(user_auth_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tm.team_id 
  FROM team_members tm
  JOIN users u ON u.id = tm.user_id
  WHERE u.auth_user_id = user_auth_id 
  AND tm.status = 'active';
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage members" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;

-- Create new non-recursive policies
CREATE POLICY "Users can view own team members"
  ON team_members FOR SELECT
  USING (team_id IN (SELECT public.get_user_team_ids(auth.uid())));

CREATE POLICY "Team owners can manage members"
  ON team_members FOR ALL
  USING (
    team_id IN (
      SELECT id FROM teams WHERE owner_id IN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );