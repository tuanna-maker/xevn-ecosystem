import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { isQaDeepLinkLoginEnabled } from '../config/qaLogin';
import { getDefaultBaseUrl } from '../integrations/hrmApiClient';
import { parseQaLoginDeepLink, qaDeepLinkToSignInPayload } from '../integrations/qaLoginDeepLink';

export function useQaLoginDeepLink(): void {
  const { hydrated, signedIn, signIn, employeeId, accessToken } = useAuth();
  const busyRef = useRef(false);

  useEffect(() => {
    if (!isQaDeepLinkLoginEnabled() || !hydrated) return;

    const handleUrl = async (url: string | null | undefined) => {
      if (!url || busyRef.current) return;
      const params = parseQaLoginDeepLink(url);
      if (!params) return;

      const sameSession =
        signedIn &&
        params.accessToken === accessToken.trim() &&
        (!params.employeeId || params.employeeId === employeeId.trim());
      if (sameSession) return;

      busyRef.current = true;
      try {
        const payload = qaDeepLinkToSignInPayload(params);
        if (!payload.baseUrl.trim()) payload.baseUrl = getDefaultBaseUrl();
        await signIn(payload);
      } finally {
        busyRef.current = false;
      }
    };

    void Linking.getInitialURL().then((url) => void handleUrl(url));
    const sub = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });
    return () => sub.remove();
  }, [hydrated, signedIn, signIn, employeeId, accessToken]);
}
