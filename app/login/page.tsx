'use client'

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import Back from "@/components/back";
import Image from 'next/image'
import styles from './page.module.css'
import { authClientService } from "@/service/auth.client.service";

export const Login = () => {
    const router = useRouter()
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: SubmitEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await fetch('/api/auth/login', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ login, password })
            })
            if (!result.ok) {
                const errorData = await result.json().catch(() => null);
                const message = errorData.message;
                throw new Error(message);
            }else{
                const data = await result.json();
                authClientService.login(data);
                router.push('/home');
            }

        } catch (err: any) {
            console.log("error",err)
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center bg-background">
            <Back url='/' />

            <Image
                src='/images/logo.png'
                alt='logo MDD'
                width={412*0.7}
                height={238*0.7}
                className={styles.logo}
            />

            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8" data-cy="title">
                Se connecter
            </h2>

            {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-cy="login_error">
                {error}
            </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login_input" data-cy="login_label">
                        Email ou nom d'utilisateur
                    </label>
                    <input
                    id="login_input"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password_input">
                        Mot de passe
                    </label>
                    <input
                    id="password_input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    required
                    />
                </div>

                <button
                    data-cy="submit"
                    type="submit"
                    disabled={loading}
                    className="items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    {loading ? 'Chargement...' : 'Se connecter'}
                </button>
            </form>

        </div>
    );
};

export default Login;