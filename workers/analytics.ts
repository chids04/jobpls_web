type TrackOptions = {
  userId?: string;
  tags?: string[];
  values?: number[];
};

export function track(env: Env, event: string, options: TrackOptions = {}) {
  if (!env.ANALYTICS) return;

  env.ANALYTICS.writeDataPoint({
    blobs: [event, options.userId ?? "", ...(options.tags ?? [])],
    doubles: options.values ?? [],
    indexes: [event],
  });
}
