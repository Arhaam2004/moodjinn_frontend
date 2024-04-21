'use client'

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {signIn} from "next-auth/react";
import {redirect} from "next/navigation";

export default function SignIn(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return(
        <main className={"w-full h-screen"}>
            <div className={"w-full h-full items-center justify-center flex"}>
                <div>
                    <Input onChange={(e)=>setEmail(e.target.value)} type="email" placeholder={"email"}/>
                    <Input onChange={(e)=>setPassword(e.target.value)} type="password" placeholder={"password"}/>
                    <Button
                        onClick={()=>signIn('credentials', {email, password, redirect: true, callbackUrl: '/'})}
                    >Log In</Button>
                </div>
            </div>
        </main>
    )

}