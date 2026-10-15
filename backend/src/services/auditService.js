const isMissingAuditTable = (error) => ['42P01', 'PGRST205'].includes(error?.code);

export const writeLoadEvent = async (db, event) => {
  try {
    const { error } = await db.from('load_events').insert({
      load_id: Number(event.load_id),
      actor_user_id: event.actor_user_id ? Number(event.actor_user_id) : null,
      event_type: event.event_type,
      entity_type: event.entity_type || 'load',
      entity_id: event.entity_id ? Number(event.entity_id) : null,
      from_status: event.from_status || null,
      to_status: event.to_status || null,
      metadata: event.metadata || {},
    });
    if (error) {
      if (!isMissingAuditTable(error)) console.error('Operational audit event could not be recorded', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Operational audit event could not be recorded', error);
    return false;
  }
};

export { isMissingAuditTable };
