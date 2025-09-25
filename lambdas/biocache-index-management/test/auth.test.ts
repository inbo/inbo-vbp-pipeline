import { AuthError, AuthService } from "../src/auth";

import { createJWKSMock } from "mock-jwks";
const jwksMock = createJWKSMock("http://localhost:9999");

describe("AuthService", () => {
    let authService: AuthService;

    beforeAll(() => {
        return jwksMock.start();
    });

    beforeEach(() => {
        authService = new AuthService({
            jwksUri: "http://localhost:9999/.well-known/jwks.json",
        });
    });

    it("should throw UNAUTHENTICATED if no authorization header", async () => {
        await expect(authService.authenticate({})).rejects.toThrow(
            new AuthError(
                "UNAUTHENTICATED",
                "No authorization header provided",
            ),
        );
        await expect(authService.authenticate(null)).rejects.toThrow(
            new AuthError(
                "UNAUTHENTICATED",
                "No authorization header provided",
            ),
        );
    });

    it("should throw UNAUTHORIZED if token is invalid", async () => {
        await expect(
            authService.authenticate({ authorization: "Bearer invalidtoken" }),
        ).rejects.toThrow(new AuthError("UNAUTHENTICATED", "Invalid token"));
    });

    it("should throw UNAUTHORIZED if user does not have ADMIN role", async () => {
        const token = jwksMock.token({
            sub: "123",
            realm_access: { roles: ["USER"] },
        });
        await expect(
            authService.authenticate({ authorization: `Bearer ${token}` }),
        ).rejects.toThrow(
            new AuthError(
                "UNAUTHORIZED",
                "User does not have the required role",
            ),
        );
    });

    it("should return user if valid and has ADMIN role", async () => {
        const token = jwksMock.token({
            sub: "123",
            realm_access: { roles: ["ADMIN"] },
        });
        await expect(
            authService.authenticate({ authorization: `Bearer ${token}` }),
        ).resolves.toEqual({
            id: "123",
            roles: ["ADMIN"],
        });
    });
});
