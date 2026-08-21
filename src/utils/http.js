export function ok(res, data, meta) {
  return res.json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

export function legacy(res, data) {
  return res.json(data);
}
