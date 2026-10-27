import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Joining a church is decided entirely on the server:
// - the caller's role is always "member"; a client-supplied role is ignored
// - the join code is compared here, so the code value is never trusted from the client
// - "active" vs "pending" is computed here, never sent by the caller
// This app is public without login, so a member may have no platform account:
// every trust decision lives in this handler rather than in an auth gate.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const churchId = typeof body.church_id === 'string' ? body.church_id.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const code = typeof body.join_code === 'string' ? body.join_code.trim() : '';

    if (!churchId) return Response.json({ error: 'church_id is required' }, { status: 400 });
    if (!name || !email) {
      return Response.json({ error: 'Your name and email are required.' }, { status: 400 });
    }
    if (name.length > 120 || email.length > 200 || phone.length > 40 || code.length > 40) {
      return Response.json({ error: 'One of the details you entered is too long.' }, { status: 400 });
    }

    const church = await base44.asServiceRole.entities.Church.get(churchId).catch((e) =>
      e.status === 404 || e.status === 400 ? null : Promise.reject(e),
    );
    if (!church) return Response.json({ error: 'That church was not found.' }, { status: 404 });

    const expectedCode = (church.join_code || '').trim().toUpperCase();
    const codeMatches = !expectedCode || expectedCode === code.toUpperCase();

    const membership = await base44.asServiceRole.entities.Membership.create({
      church_id: church.id,
      member_key: crypto.randomUUID(),
      name,
      email,
      phone,
      role: 'member',
      status: codeMatches ? 'active' : 'pending',
      department_ids: [],
      joined_date: new Date().toISOString().slice(0, 10),
    });

    return Response.json({ membership, church_name: church.name });
  } catch (error) {
    return Response.json({ error: error.message || 'Could not join this church.' }, { status: 500 });
  }
}