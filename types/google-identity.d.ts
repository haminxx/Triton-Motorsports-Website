export {};

declare global {
  interface GoogleIdentityCredentialResponse {
    credential: string;
  }

  interface GoogleIdentityPromptMoment {
    isNotDisplayed(): boolean;
    isSkippedMoment(): boolean;
    isDismissedMoment(): boolean;
  }

  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleIdentityCredentialResponse) => void;
          }) => void;
          prompt: (
            momentListener?: (notification: GoogleIdentityPromptMoment) => void,
          ) => void;
        };
      };
    };
  }
}
