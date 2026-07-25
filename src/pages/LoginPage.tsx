<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        alert("welcome to our platform.!");
      } else {
        await signInWithEmail(email, password);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
=======
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password, fullName)
        alert('welcome to our platform.!')
      } else {
        await signInWithEmail(email, password)
        navigate('/')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
<<<<<<< HEAD
          {isSignUp ? "Create an account" : "Sign in"}
=======
          {isSignUp ? 'Create an account' : 'Sign in'}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
        </h2>

        {/* Google Login */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 mb-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          <span className="font-medium text-gray-700 dark:text-gray-200">
            Continue with Google
          </span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
<<<<<<< HEAD
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
              or
            </span>
=======
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">or</span>
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
<<<<<<< HEAD
              onChange={(e) => setFullName(e.target.value)}
=======
              onChange={e => setFullName(e.target.value)}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-transparent text-gray-900 dark:text-white"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
<<<<<<< HEAD
            onChange={(e) => setEmail(e.target.value)}
=======
            onChange={e => setEmail(e.target.value)}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-transparent text-gray-900 dark:text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
<<<<<<< HEAD
            onChange={(e) => setPassword(e.target.value)}
=======
            onChange={e => setPassword(e.target.value)}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-transparent text-gray-900 dark:text-white"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
<<<<<<< HEAD
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
=======
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
<<<<<<< HEAD
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
=======
          {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary-600 font-medium hover:underline"
          >
<<<<<<< HEAD
            {isSignUp ? "Sign In" : "Sign Up"}
=======
            {isSignUp ? 'Sign In' : 'Sign Up'}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          </button>
        </p>
      </div>
    </div>
<<<<<<< HEAD
  );
}
=======
  )
}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
