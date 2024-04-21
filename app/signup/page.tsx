'use client'

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {createUserWithEmailAndPassword} from "@firebase/auth";
import {auth, db} from "@/firebase.config";
import {addDoc, collection} from "@firebase/firestore";
import {signIn, useSession} from "next-auth/react";
import {redirect, useRouter, useSearchParams} from "next/navigation";
import axios from "axios";
import {red} from "next/dist/lib/picocolors";

function setlocal(key: string, value: string) {
    typeof window !== 'undefined' ? window.localStorage.setItem(key, value) : null;
}

function getlocal(key: string) {
    const value = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    return value;
}

export default function SignUp(){

    const router = useRouter();

    const searchParams = useSearchParams();
    const code = searchParams?.get('code') ?? null
    const state = searchParams?.get('state') ?? null

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [spotify, setSpotify] = useState(true)
    const [access, setAccess] = useState<string | null>(null)
    const [refresh, setRefresh] = useState<string | null>(null)

    const session = useSession({
        required: true,
        onUnauthenticated() {
            setSpotify(false);
        }
    })

    const signUp = ()=> {
        createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            setUserId(user.uid);
            writeUserData(user.uid);
            // ...
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        })
    }

    function spotifyAuthInit(){
        axios.get(`http://localhost:8000/api/spotify-login/`)
            .then((response) => {
                console.log(response.data.login_url);
                router.push(response.data.login_url)
            });
    }

    function handleSpotifyCallback(code: string, state: string) {
        const tokenUrl = 'http://localhost:8000/api/spotify-callback?code=' + code + '&state=' + state;
        const payload = new URLSearchParams({
            code: code,
            state: state
        });

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        return axios.get(tokenUrl)
            .then(response => {
                const { data } = response;
                const access_token = data.access_token;
                const refresh_token = data.refresh_token;
                // You can store or process the access token and refresh token here
                console.log("refresh", refresh_token);
                console.log("access", access_token);
                setlocal("access", access_token);
                setlocal("refresh", refresh_token);
                setAccess(access_token);
                setRefresh(refresh_token);
                return { access_token, refresh_token };
            })
            .catch(error => {
                console.log('Failed to authenticate with Spotify');
            });
    }

    console.log(session.data)
    if(session.data) {

    }

    useEffect(() => {
        if(code !== null && state!== null){
            if(access === null || refresh === null) {
                handleSpotifyCallback(code, state);
            }
        }
    }, [code, state]);

    async function writeUserData(uid: string) {
        await addDoc(collection(db, "users"), {
            uid: uid,
            email: email,
            first_name: firstName,
            lastName: lastName,
            age: age,
            spotify_connected: !!refresh,
            spotify_access: access,
            spotify_refresh: refresh
        });
    }


    return(
        <main className={"w-full h-screen"}>
            <div className={"w-full h-full items-center justify-center flex"}>
                <div>
                    <Input onChange={(e)=>setEmail(e.target.value)} type="email" placeholder={"email"}/>
                    <Input onChange={(e)=>setFirstName(e.target.value)} type="text" placeholder={"first name"}/>
                    <Input onChange={(e)=>setLastName(e.target.value)} type="text" placeholder={"last name"}/>
                    <Input onChange={(e)=>setAge(e.target.value)} type="text" placeholder={"age"}/>

                    <Input onChange={(e)=>setPassword(e.target.value)} type="password" placeholder={"password"}/>
                    <Button onClick={spotifyAuthInit}>{code ? "Spotify Connected" : "Connect Spotify"}</Button>
                    <Button onClick={signUp}>Register</Button>
                </div>
            </div>
        </main>
    )

}