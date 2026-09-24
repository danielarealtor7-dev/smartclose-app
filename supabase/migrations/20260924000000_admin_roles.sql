-- Add update policy for users table to allow SUPER_ADMIN or ADMIN to update user roles

create policy "Admins can update users in same org"
on public.users for update
using (
    org_id = get_current_org_id() 
    and (
        select role from public.users where auth_id = auth.uid() limit 1
    ) in ('SUPER_ADMIN', 'ADMIN')
)
with check (
    org_id = get_current_org_id()
);
