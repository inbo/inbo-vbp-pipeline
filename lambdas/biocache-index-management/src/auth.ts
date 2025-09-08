import { JwksClient } from "jwks-rsa";
import { JwtHeader, JwtPayload, SignCallback, verify } from "jsonwebtoken";
import { User } from "./core/user";

export class AuthError extends Error {
    public readonly code: "UNAUTHENTICATED" | "UNAUTHORIZED";

    constructor(code: "UNAUTHENTICATED" | "UNAUTHORIZED", message: string) {
        super(message);
        this.code = code;
        this.name = "AuthError";
    }

    status(): number {
        return this.code === "UNAUTHENTICATED" ? 401 : 403;
    }
}

export class AuthService {
    private readonly jwksClient: JwksClient;

    constructor({ jwksUri }: { jwksUri: string }) {
        this.jwksClient = new JwksClient({ jwksUri });
        this.jwksClient.getKeys();
    }

    async authenticate(
        headers?: { [name: string]: string | undefined } | null,
    ): Promise<User> {
        if (!headers?.authorization) {
            throw new AuthError(
                "UNAUTHENTICATED",
                "No authorization header provided",
            );
        }
        let user: User | null;
        user = await this.verifyToken(
            headers?.authorization?.replace("Bearer ", "") || "",
        );

        if (!user) {
            throw new AuthError("UNAUTHORIZED", "Invalid user provided");
        }
        if (!user.roles.includes("ADMIN")) {
            throw new AuthError(
                "UNAUTHORIZED",
                "User does not have the required role",
            );
        }

        return user;
    }

    private async verifyToken(token: string): Promise<User | null> {
        return new Promise((resolve, reject) =>
            verify(
                token,
                async (header: JwtHeader, callback: SignCallback) => {
                    const key = await this.jwksClient.getSigningKey(header.kid);
                    callback(null, key.getPublicKey());
                },
                (error, payload) => {
                    if (error) {
                        console.warn("Token verification error:", error);
                        reject(new AuthError("UNAUTHORIZED", "Invalid token"));
                    } else {
                        const user = this.parseUser(payload);
                        resolve(user);
                    }
                },
            )
        );
    }

    private parseUser(payload: string | JwtPayload | undefined): User | null {
        if (!payload) {
            return null;
        }
        if (typeof payload === "string") {
            return null;
        }
        return {
            id: payload.sub as string,
            roles: payload.realm_access?.roles
                ? payload.realm_access?.roles as string[]
                : [],
        };
    }
}
