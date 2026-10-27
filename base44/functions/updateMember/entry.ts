import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ALLOWED_ROLES = ['member', 'leader', 'admin'];
const ALLOWED_STATUSES = ['active', 'pending'];

// Membership records are managed only from here, so no client can change a role,
// a status, or a department list on its own. The caller must hold a membership in
// the same church with role "admin"; a non-admin can never grant admin or leader.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const churchId = typeof body.church_id === 'string' ? body.church_id.trim() : '';
    const callerKey = typeof body.caller_key === 'string' ? body.caller_key.trim() : '';
    const membershipId = typeof body.membership_id === 'string' ? body.membership_id.trim() : '';
    const remove = body.remove === true;
    const updates = body.updates && typeof body.updates === 'object' ? body.updates : {};

    if (!churchId || !callerKey || !membershipId) {
      return Response.json(
        { error: 'church_id, caller_key and membership_id are required' },
        { status: 400 },
      );
    }

    const callerPage = await base44.asServiceRole.entities.Membership.filter(
      { church_id: churchId, member_key: callerKey },
      { limit: 1 },
    );
    const caller = callerPage.items?.[0] || null;
    if (!caller) return Response.json({ error: 'You are not a member of this church.' }, { status: 403 });
    if (caller.role !== 'admin') {
      return Response.json({ error: 'Only church admins can manage members.' }, { status: 403 });
    }

    const target = await base44.asServiceRole.entities.Membership.get(membershipId).catch((e) =>
      e.status === 404 ? null : Promise.reject(e),
    );
    if (!target) return Response.json({ error: 'That member was not found.' }, { status: 404 });
    if (target.church_id !== churchId) {
      return Response.json({ error: 'That member is not in this church.' }, { status: 403 });
    }

    if (remove) {
      await base44.asServiceRole.entities.Membership.delete(target.id);
      return Response.json({ removed: target.id });
    }

    const data = {};

    if (typeof updates.name === 'string') {
      const name = updates.name.trim();
      if (!name) return Response.json({ error: 'Every member needs a name.' }, { status: 400 });
      if (name.length > 120) return Response.json({ error: 'That name is too long.' }, { status: 400 });
      data.name = name;
    }
    if (typeof updates.email === 'string') {
      const email = updates.email.trim();
      if (email.length > 200) return Response.json({ error: 'That email is too long.' }, { status: 400 });
      data.email = email;
    }
    if (typeof updates.phone === 'string') {
      const phone = updates.phone.trim();
      if (phone.length > 40) return Response.json({ error: 'That phone number is too long.' }, { status: 400 });
      data.phone = phone;
    }
    if (updates.role !== undefined) {
      if (!ALLOWED_ROLES.includes(updates.role)) {
        return Response.json({ error: 'That role is not allowed.' }, { status: 400 });
      }
      data.role = updates.role;
    }
    if (updates.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(updates.status)) {
        return Response.json({ error: 'That status is not allowed.' }, { status: 400 });
      }
      data.status = updates.status;
    }
    if (updates.department_ids !== undefined) {
      if (!Array.isArray(updates.department_ids)) {
        return Response.json({ error: 'department_ids must be a list.' }, { status: 400 });
      }
      const departmentPage = await base44.asServiceRole.entities.Department.filter(
        { church_id: churchId },
        { limit: 200 },
      );
      const validIds = new Set((departmentPage.items || []).map((department) => department.id));
      data.department_ids = updates.department_ids
        .filter((id) => typeof id === 'string' && validIds.has(id))
        .slice(0, 200);
    }

    if (Object.keys(data).length === 0) {
      return Response.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const membership = await base44.asServiceRole.entities.Membership.update(target.id, data);
    return Response.json({ membership });
  } catch (error) {
    return Response.json({ error: error.message || 'Could not save this member.' }, { status: 500 });
  }
}