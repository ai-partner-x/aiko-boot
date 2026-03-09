/**
 * 生产者接口定义
 */

export interface MqProducer {
  send<T>(queue: string, payload: T, traceId?: string): Promise<void>;
}
