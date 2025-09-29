import { withAuthenticationRequired } from "react-oidc-context";

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Inbo VBP Pipeline</h1>
            </header>
            <main>{children}</main>
        </div>
    );
}

export const LayoutWithAuth = withAuthenticationRequired(Layout);
