'use client'

import { useState, SubmitEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Back from "@/components/back";
import Image from 'next/image'
import styles from './page.module.css'
import { CreateUserDTO } from "@/dto/user.dto";
import { authService } from "@/service/auth.service";

export const Register = () => {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [formData, setFormData] = useState<CreateUserDTO>({
        username: '',
        email: '',
        password: '',
    });

    const handleChange = (e: ChangeEvent & {target: HTMLInputElement}): void => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: SubmitEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.register(formData);
            router.push('/home');
        } catch (err: any) {
            setError(err || 'Registration failed');
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
                Inscription
            </h2>

            {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-cy="register_error">
                {error}
            </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username_input">
                Nom d'utilisateur
                </label>
                <input
                id="username_input"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email_input">
                Email
                </label>
                <input
                id="email_input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor='password_input'>
                Password
                </label>
                <input
                id="password_input"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
                minLength={8}
                />
            </div>

            <button
                data-cy="submit"
                type="submit"
                disabled={loading}
                className="items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
            </form>
        </div>
    );
};

export default Register;