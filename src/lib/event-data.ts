export type EventDataObject = Record<string, unknown>;

export function getEventData(data: unknown): EventDataObject {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }
  return { ...(data as EventDataObject) };
}

export function readEventCollection<T>(data: unknown, key: string): T[] {
  const eventData = getEventData(data);
  const value = eventData[key];
  return Array.isArray(value) ? (value as T[]) : [];
}

export function writeEventCollection<T>(
  data: unknown,
  key: string,
  values: T[]
): EventDataObject {
  const eventData = getEventData(data);
  eventData[key] = values;
  return eventData;
}
