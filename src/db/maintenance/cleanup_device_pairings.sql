delete from device_pairings
where claimed_device_id is null
  and expires_at < now() - interval '1 day';

delete from device_pairings
where authorized_at is not null
  and consumed_at is null
  and authorized_at < now() - interval '7 days';

delete from device_pairings
where consumed_at is not null
  and consumed_at < now() - interval '30 days';
