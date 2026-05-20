export type HttpRequestLabels = {
  method: string;
  route: string;
  status_code: string;
};

export type HttpDurationLabels = {
  method: string;
  route: string;
};

export type ProcessWithActiveResources = {
  _getActiveHandles: () => unknown[];
  _getActiveRequests: () => unknown[];
};
