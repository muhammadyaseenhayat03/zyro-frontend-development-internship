import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { seedUsers } from "../data/users";

const AuthContext = createContext(null);

const USERS_KEY = "waypoint.users";
const SESSION_KEY = "waypoint.session";

function loadUsers() {
  let stored = [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) stored = JSON.parse(raw);
    if (!Array.isArray(stored)) stored = [];
  } catch {
    stored = [];
  }

  if (stored.length === 0) return seedUsers;

  // A returning browser may have a users list saved before new seed/demo
  // accounts were added to the app (e.g. a new demo rider). Merge in any
  // seed account that's missing by id, without touching real accounts the
  // person registered or any existing seed account's current data.
  const storedIds = new Set(stored.map((u) => u.id));
  const missingSeeds = seedUsers.filter((u) => !storedIds.has(u.id));
  return missingSeeds.length ? [...stored, ...missingSeeds] : stored;
}

function loadSession(users) {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { id } = JSON.parse(raw);
    return users.find((u) => u.id === id) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  // Reuses the `users` computed just above instead of calling loadUsers()
  // (which reads + parses localStorage) a second time on mount.
  const [user, setUser] = useState(() => loadSession(users));

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = useCallback(
    (email, password) => {
      const match = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (!match) return { ok: false, error: "Email or password is incorrect." };
      setUser(match);
      return { ok: true, user: match };
    },
    [users]
  );

  const register = useCallback(
    ({ name, email, password, role }) => {
      const exists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) return { ok: false, error: "An account with this email already exists." };
      const newUser = {
        id: `${role}-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };
      setUsers((prev) => [...prev, newUser]);
      setUser(newUser);
      return { ok: true, user: newUser };
    },
    [users]
  );

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async ({ delayMs = 250, forceFail = false } = {}) => {
    setIsLoggingOut(true);
    try {
      const activeDelay = window.__simulateSlowLogout ? 1500 : delayMs;
      if (activeDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, activeDelay));
      }
      if (forceFail || window.__simulateFailLogout) {
        throw new Error("Logout operation encountered an unexpected error.");
      }
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      return { ok: true };
    } catch (err) {
      console.error("Logout error:", err);
      // Clean up session and user regardless of error so auth state is never stuck
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {}
      setUser(null);
      return { ok: false, error: err?.message || "Failed to log out cleanly." };
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  // Memoized so this object's identity only changes when the data it
  // actually carries changes — otherwise every consumer of useAuth() (most
  // pages in the app) would re-render on every AuthProvider render, even one
  // triggered by something unrelated.
  const value = useMemo(
    () => ({ user, users, login, register, logout, isLoggingOut }),
    [user, users, login, register, logout, isLoggingOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
