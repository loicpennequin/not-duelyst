export const useSessionId = () => {
  const sessionId = useState<string | null>('sessionId', () => null);

  return sessionId;
};
