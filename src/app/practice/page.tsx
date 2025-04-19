'use client'
import React, { useState, ChangeEvent, useEffect } from "react";
import styles from "./page.module.css";
import { createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { auth, sendVerificationEmail } from "@/lib/firebase";

interface InputFieldProps {
    type: string;
    plaseholder: string;
    handleChange: (value: string) => void;
}

const InputField = ({plaseholder, handleChange, type}: InputFieldProps) => {
    const [inputValue, setInputValue] = useState<string>("");
    const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        handleChange(e.target.value); 
    }
    return(
        <input 
            value={inputValue} 
            placeholder={plaseholder} 
            onChange={handleChangeEvent} 
            type={type} 
            className={styles.inputField}
        />
    )
}

export default function Page() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [credential, setCredential] = useState<UserCredential | null>(null);

    const signUpAction = async () => {
        try {
            const userCred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
            setCredential(userCred);
            await sendVerificationEmail(userCred.user);
            console.log("Success - Verification email sent!");
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during sign up');
            console.error(err);
        }
    };

    useEffect(() => {
        console.log(credential);
    }, [credential]);
    
    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                {error && <div className={styles.error}>{error}</div>}
                <InputField 
                    type="email" 
                    plaseholder="Enter your Email" 
                    handleChange={(data: string) => setEmail(data)}
                />
                <InputField 
                    type="password" 
                    plaseholder="Enter your password" 
                    handleChange={(data: string) => setPassword(data)}
                />
                <button 
                    type="button" 
                    onClick={signUpAction} 
                    className={styles.submitButton}
                >
                    Sign up
                </button>
            </div>
        </div>
    );
}
