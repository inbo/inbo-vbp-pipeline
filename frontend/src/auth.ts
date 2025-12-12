import { settings } from "./settings";

export const oidcConfig = {
    authority: settings.auth.authority,
    client_id: settings.auth.client_id,
    redirect_uri: settings.auth.redirectUrl,
    scope: "openid email ala/roles offline_access",
    onSigninCallback: (): void => {
        window.history.replaceState({}, document.title, window.location.pathname);
    },
};
