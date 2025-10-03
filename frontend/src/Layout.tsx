import "./styles/Layout.css";

import { withAuthenticationRequired } from "react-oidc-context";
import { Link } from "react-router";

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <header>
                <Link className="title-header-link" to="/">
                    <h1>Inbo VBP Pipeline</h1>
                </Link>
            </header>
            <main>{children}</main>
        </div>
    );
}

export const LayoutWithAuth = withAuthenticationRequired(Layout);
