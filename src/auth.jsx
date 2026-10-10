import { createContext, useContext, useState } from "react";
import { HeroBottle } from "./bottle.jsx";
import { useStore } from "./store.jsx";

// Authentication context
const Ctx = createContext(null);

export const useAuth = () => useContext(Ctx);

// Read data from localStorage
const read = (key, defaultValue) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Save data to localStorage
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Unable to save data:", error);
  }
};

// Hash password
async function hash(password) {
  if (!globalThis.crypto?.subtle) {
    return password;
  }

  const buffer = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  );

  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Authentication provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    read("veloura:user", null)
  );

  const finish = (newUser) => {
    write("veloura:user", newUser);
    setUser(newUser);
    return null;
  };

  // Create account
  const signUp = async (name, email, password) => {
    const users = read("veloura:users", {});
    const key = email.trim().toLowerCase();

    if (users[key]) {
      return "An account with this email already exists. Try signing in.";
    }

    users[key] = {
      name,
      pw: await hash(password),
    };

    write("veloura:users", users);

    return finish({
      name,
      email: key,
    });
  };

  // Sign in
  const signIn = async (email, password) => {
    const users = read("veloura:users", {});
    const key = email.trim().toLowerCase();
    const account = users[key];

    if (!account || account.pw !== (await hash(password))) {
      return "Email or password is incorrect.";
    }

    return finish({
      name: account.name,
      email: key,
    });
  };

  // Sign out
  const signOut = () => {
    try {
      localStorage.removeItem("veloura:user");
    } catch (error) {
      console.error("Unable to sign out:", error);
    }

    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

// Login and signup page
export function Login({ go }) {
  const { user, signIn, signUp, signOut } = useAuth();
  const { say } = useStore();

  const [mode, setMode] = useState("in");
  const [form, setForm] = useState({
    name: "",
    email: "",
    pw: "",
  });

  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === "up";

  const updateField = (field) => (event) => {
    setForm({
      ...form,
      [field]: event.target.value,
    });

    setErr("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setErr("");

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.pw;

    if (isSignUp && name.length < 2) {
      setErr("Please enter your name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);

    try {
      const message = isSignUp
        ? await signUp(name, email, password)
        : await signIn(email, password);

      if (message) {
        setErr(message);
        return;
      }

      say(isSignUp ? "Welcome to Veloura" : "Welcome back");
      go("home");
    } catch (error) {
      console.error("Authentication error:", error);
      setErr("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="authart">
        <HeroBottle />

        <h2 className="serif">Welcome to Veloura</h2>

        <p className="meta big">
          Save your wishlist, track your bag and unlock gift
          personalization.
        </p>
      </div>

      <div className="authform card">
        {user ? (
          <>
            <h2 className="serif" style={{ fontSize: 34 }}>
              Hello, {user.name.split(" ")[0]}
            </h2>

            <p className="meta">
              Signed in as {user.email}
            </p>

            <div className="ctas" style={{ marginTop: 24 }}>
              <button
                className="btn"
                onClick={() => go("collection")}
              >
                Continue shopping
              </button>

              <button
                className="btn ghost"
                onClick={() => {
                  signOut();
                  say("Signed out");
                }}
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="chips" style={{ marginTop: 0 }}>
              <button
                type="button"
                className={`chip ${!isSignUp ? "on" : ""}`}
                onClick={() => {
                  setMode("in");
                  setErr("");
                }}
              >
                Sign in
              </button>

              <button
                type="button"
                className={`chip ${isSignUp ? "on" : ""}`}
                onClick={() => {
                  setMode("up");
                  setErr("");
                }}
              >
                Create account
              </button>
            </div>

            <h2
              className="serif"
              style={{ fontSize: 34, marginBottom: 14 }}
            >
              {isSignUp ? "Create your account" : "Sign in"}
            </h2>

            {isSignUp && (
              <>
                <label htmlFor="n">Full name</label>

                <input
                  id="n"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={updateField("name")}
                />
              </>
            )}

            <label htmlFor="e">Email</label>

            <input
              id="e"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField("email")}
            />

            <label htmlFor="p">Password</label>

            <div className="pw">
              <input
                id="p"
                type={show ? "text" : "password"}
                autoComplete={
                  isSignUp ? "new-password" : "current-password"
                }
                value={form.pw}
                onChange={updateField("pw")}
              />

              <button
                type="button"
                className="chip"
                onClick={() => setShow(!show)}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>

            {err && (
              <p className="err" role="alert">
                {err}
              </p>
            )}

            <button
              className="btn"
              type="submit"
              style={{ width: "100%", marginTop: 20 }}
              disabled={busy}
            >
              {busy
                ? "Please wait..."
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>

            <button
              type="button"
              className="chip"
              style={{ width: "100%", marginTop: 12 }}
              onClick={() => go("home")}
            >
              Continue as guest
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
