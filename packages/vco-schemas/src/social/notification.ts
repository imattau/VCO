import { Notification } from "../generated/social/notification.pb.js";

export const NOTIFICATION_SCHEMA_URI = "vco://schemas/social/notification/v1";

export enum NotificationType {
  UNKNOWN = 0,
  DM = 1,
  POST_REPLY = 2,
  REACTION = 3,
  FOLLOW = 4,
}

export interface NotificationData {
  schema: string;
  type: NotificationType;
  actorCid: Uint8Array;
  targetCid: Uint8Array;
  summary: string;
  timestampMs: bigint;
}

export function encodeNotification(data: NotificationData): Uint8Array {
  const msg = Notification.create({
    schema: data.schema,
    type: data.type as any,
    actorCid: data.actorCid,
    targetCid: data.targetCid,
    summary: data.summary,
    timestampMs: Number(data.timestampMs),
  });
  return Notification.encode(msg).finish();
}

export function decodeNotification(bytes: Uint8Array): NotificationData {
  const msg = Notification.decode(bytes);
  return {
    schema: msg.schema,
    type: msg.type as any,
    actorCid: new Uint8Array(msg.actorCid),
    targetCid: new Uint8Array(msg.targetCid),
    summary: msg.summary,
    timestampMs: BigInt(msg.timestampMs?.toString() ?? "0"),
  };
}
