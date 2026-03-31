import { 
  NOTIFICATION_SCHEMA_URI,
  NotificationData,
  NotificationType
} from '@vco/vco-schemas';

export class NotificationService {
  /**
   * Generates a notification event for the sync layer.
   */
  static generateNotification(
    type: NotificationType, 
    actorCid: Uint8Array, 
    targetCid: Uint8Array, 
    summary: string
  ): NotificationData {
    return {
      schema: NOTIFICATION_SCHEMA_URI,
      type,
      actorCid,
      targetCid,
      summary,
      timestampMs: BigInt(Date.now())
    };
  }
}
