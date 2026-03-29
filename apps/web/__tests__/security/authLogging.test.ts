const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockEq = jest.fn().mockReturnThis();
const mockGte = jest.fn().mockReturnThis();
const mockNeq = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockLt = jest.fn().mockReturnThis();

const mockSelect = jest.fn().mockImplementation(() => ({
    eq: mockEq,
    gte: mockGte,
    neq: mockNeq,
    order: mockOrder,
    limit: mockLimit,
    lt: mockLt,
    then: (resolve: any) => resolve({ data: [], count: 0, error: null }),
}));

const mockFrom = jest.fn().mockImplementation(() => ({
    insert: mockInsert,
    select: mockSelect,
}));

const mockSupabase = {
    from: mockFrom,
};

// Mock Supabase - this is hoisted
jest.mock("@supabase/supabase-js", () => ({
    createClient: jest.fn(() => mockSupabase),
}));

// Mock Next.js headers
jest.mock("next/headers", () => ({
    headers: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue("127.0.0.1"),
    }),
}));

import { logAuthEvent, AuthEventType } from "@/lib/security/authLogging";

describe("authLogging", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset defaults for each test
        mockInsert.mockResolvedValue({ error: null });
        mockSelect.mockImplementation(() => ({
            eq: mockEq,
            gte: mockGte,
            neq: mockNeq,
            order: mockOrder,
            limit: mockLimit,
            lt: mockLt,
            then: (resolve: any) => resolve({ data: [], count: 0, error: null }),
        }));
    });

    it("logs a basic auth event", async () => {
        const payload = {
            publicKey: "GA...",
            eventType: AuthEventType.LOGIN_ATTEMPT,
            status: "SUCCESS" as const,
        };

        await logAuthEvent(payload);

        expect(mockFrom).toHaveBeenCalledWith("auth_events");
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            public_key: "GA...",
            event_type: AuthEventType.LOGIN_ATTEMPT,
            status: "SUCCESS",
        }));
    });

    it("triggers brute force detection on failure", async () => {
        const payload = {
            publicKey: "GA...",
            eventType: AuthEventType.LOGIN_FAILURE,
            status: "FAILURE" as const,
        };

        // Mock select chain to return a high count
        mockSelect.mockImplementation(() => ({
            eq: mockEq,
            gte: mockGte,
            then: (resolve: any) => resolve({ count: 10, error: null }),
        }));

        await logAuthEvent(payload);

        // Should have logged the failure event
        expect(mockFrom).toHaveBeenCalledWith("auth_events");

        // Should have checked for brute force (calls to auth_events) and then triggered alert
        expect(mockFrom).toHaveBeenCalledWith("security_alerts");
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            alert_type: "BRUTE_FORCE",
            severity: "HIGH",
        }));
    });

    it("detects new device login", async () => {
        const payload = {
            publicKey: "GA...",
            eventType: AuthEventType.LOGIN_SUCCESS,
            status: "SUCCESS" as const,
        };

        const fullBuilder = {
            eq: mockEq,
            neq: mockNeq,
            lt: mockLt,
            order: mockOrder,
            limit: mockLimit,
            then: (resolve: any) => resolve({ data: [], count: 0, error: null }),
        };

        // 1. Insert event
        // 2. detectUnusualPatterns -> check for previous devices
        mockSelect.mockImplementation((...args: any[]) => {
            if (args[1]?.count === "exact") {
                // Secondary check: seen this device before? Return 1 (meaning this is the first time)
                return {
                    ...fullBuilder,
                    then: (resolve: any) => resolve({ count: 1, error: null }),
                };
            }
            // Primary check: previous different devices?
            return {
                ...fullBuilder,
                then: (resolve: any) => resolve({ data: [{ user_agent: "other" }], error: null }),
            };
        });

        await logAuthEvent(payload);

        expect(mockFrom).toHaveBeenCalledWith("security_alerts");
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            alert_type: "NEW_DEVICE",
        }));
    });

    it("detects suspicious IP (impossible travel)", async () => {
        const payload = {
            publicKey: "GA...",
            eventType: AuthEventType.LOGIN_SUCCESS,
            status: "SUCCESS" as const,
        };

        // Set current time fix
        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);

        mockSelect.mockImplementation((...args: any[]) => {
            if (args[0] === "ip_address, created_at") {
                // Return a login from a different IP 30 mins ago
                return {
                    eq: mockEq,
                    neq: mockNeq,
                    order: mockOrder,
                    limit: mockLimit,
                    then: (resolve: any) => resolve({
                        data: [{
                            ip_address: "1.1.1.1",
                            created_at: new Date(now - 30 * 60 * 1000).toISOString()
                        }],
                        error: null
                    }),
                };
            }
            // Fallback for other calls
            return {
                eq: mockEq,
                neq: mockNeq,
                limit: mockLimit,
                then: (resolve: any) => resolve({ data: [], error: null }),
            };
        });

        await logAuthEvent(payload);

        expect(mockFrom).toHaveBeenCalledWith("security_alerts");
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            alert_type: "SUSPICIOUS_IP",
        }));
    });
});
