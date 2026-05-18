export type HttpRequestLabels = {
  method: string;
  route: string;
  statusCode: string;
};

export type HttpDurationLabels = {
  method: string;
  route: string;
};

export type HistogramState = {
  buckets: number[];
  count: number;
  sum: number;
};

export type ProcessWithActiveResources = {
  _getActiveHandles: () => unknown[];
  _getActiveRequests: () => unknown[];
};
