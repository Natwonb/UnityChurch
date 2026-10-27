import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const FLYER_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Short event name taken from the flyer headline.' },
    description: { type: 'string', description: 'Two or three sentences describing the event for the congregation.' },
    event_date: { type: 'string', description: 'Event date as YYYY-MM-DD, or an empty string if not shown.' },
    event_time: { type: 'string', description: 'Start time in 24-hour HH:MM, or an empty string if not shown.' },
    end_time: { type: 'string', description: 'End time in 24-hour HH:MM, or an empty string if not shown.' },
    location: { type: 'string', description: 'Where the event happens, or an empty string if not shown.' },
  },
  required: ['title'],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    const body = await req.json().catch(() => ({}));

    const churchId = typeof body.church_id === 'string' ? body.church_id.trim() : '';
    const memberKey = typeof body.member_key === 'string' ? body.member_key.trim() : '';
    if (!churchId || !memberKey) {
      return Response.json({ error: 'church_id and member_key are required' }, { status: 400 });
    }

    const memberPage = await base44.asServiceRole.entities.Membership.filter(
      { church_id: churchId, member_key: memberKey },
      { limit: 1 },
    );
    const member = memberPage.items?.[0] || null;
    if (!member || member.status !== 'active') {
      return Response.json(
        { error: 'Only active church members can scan flyers.' },
        { status: 403 },
      );
    }
    const isChurchLeader = member.role === 'admin' || member.role === 'leader';
    if (!isChurchLeader && user?.role !== 'admin') {
      return Response.json({ error: 'Only church leaders can scan flyers.' }, { status: 403 });
    }

    const fileUrl = typeof body.file_url === 'string' ? body.file_url.trim() : '';
    if (!fileUrl || !/^https?:\/\//i.test(fileUrl) || fileUrl.length > 2000) {
      return Response.json({ error: 'A flyer image is required.' }, { status: 400 });
    }

    const draft = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        'You are reading a photo of a church flyer, bulletin, or event poster so it can be turned into a church announcement. ' +
        'Read all visible text carefully and extract the event details. Use the event name from the headline as the title - never the words "flyer" or "announcement". ' +
        'Write the description as two or three warm, clear sentences for the congregation based only on what the flyer shows. ' +
        'Return the date as YYYY-MM-DD (use the current year when the flyer omits it) and times as 24-hour HH:MM. ' +
        'Return an empty string for any detail that is not visible on the flyer.',
      file_urls: [fileUrl],
      response_json_schema: FLYER_SCHEMA,
    });

    return Response.json({ draft });
  } catch (error) {
    return Response.json({ error: error.message || 'Could not read the flyer.' }, { status: 500 });
  }
}