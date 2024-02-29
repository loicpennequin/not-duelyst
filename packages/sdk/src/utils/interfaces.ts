import { JSONValue } from '@hc/shared';

export interface Serializable {
  serialize(): JSONValue;
}
